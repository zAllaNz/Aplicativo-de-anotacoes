// __tests__/integration/api.integration.test.js
const request = require('supertest');
const express = require('express');
const CryptoJS = require('crypto-js');
const jwt = require('jsonwebtoken');

// Configuração do app para testes
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const apiPrefix = '/anotacoes/api/v1';

// Mock dos modelos para testes de integração
const mockUsers = new Map();
const mockNotes = new Map();
let userIdCounter = 1;
let noteIdCounter = 1;

const User = {
    findOne: jest.fn(async ({ where }) => {
        for (const [id, user] of mockUsers) {
            if (user.email === where.email) {
                return { ...user, dataValues: user };
            }
        }
        return null;
    }),
    create: jest.fn(async (data) => {
        const user = { id: userIdCounter++, ...data };
        mockUsers.set(user.id, user);
        return user;
    }),
    update: jest.fn(async (data, { where }) => {
        for (const [id, user] of mockUsers) {
            if (user.email === where.email) {
                Object.assign(user, data);
                return [1];
            }
        }
        return [0];
    })
};

const Note = {
    create: jest.fn(async (data) => {
        const note = { id: noteIdCounter++, ...data };
        mockNotes.set(note.id, note);
        return note;
    }),
    findAll: jest.fn(async ({ where }) => {
        const notes = [];
        for (const [id, note] of mockNotes) {
            if (note.user_id === where.user_id) {
                notes.push(note);
            }
        }
        return notes;
    }),
    findByPk: jest.fn(async (id) => {
        const note = mockNotes.get(parseInt(id));
        if (!note) return null;
        return {
            ...note,
            save: async function () {
                mockNotes.set(this.id, { ...this });
            },
            destroy: async function () {
                mockNotes.delete(this.id);
            }
        };
    }),
    update: jest.fn(async (data, { where }) => {
        const note = mockNotes.get(where.id);
        if (note) {
            Object.assign(note, data);
            return [1];
        }
        return [0];
    })
};

// Mock do Redis
const mockRedisData = new Map();
const mockRedisClient = {
    get: jest.fn(async (key) => mockRedisData.get(key) || null),
    setEx: jest.fn(async (key, ttl, value) => {
        mockRedisData.set(key, value);
    }),
    del: jest.fn(async (key) => {
        mockRedisData.delete(key);
    })
};

jest.mock('../../server/models/sequelize/user.model', () => User);
jest.mock('../../server/models/sequelize/note.model', () => Note);
jest.mock('../../config/redis', () => mockRedisClient);

// Mock do Nodemailer
jest.mock('nodemailer', () => ({
    createTransport: jest.fn(() => ({
        sendMail: jest.fn().mockResolvedValue({ messageId: 'test-id' })
    }))
}));

// Rotas
app.use(apiPrefix + '/auth', require('../../server/routes/auth.route'));
app.use(apiPrefix + '/notes', require('../../server/routes/note.route'));

describe('Testes de Integração - API Completa', () => {
    beforeEach(() => {
        mockUsers.clear();
        mockNotes.clear();
        mockRedisData.clear();
        userIdCounter = 1;
        noteIdCounter = 1;
        jest.clearAllMocks();
    });

    describe('Fluxo Completo de Usuário', () => {
        test('[E2E] Registro -> Login -> Criar Nota -> Listar -> Atualizar -> Deletar', async () => {
            // 1. Registro
            const registerResponse = await request(app)
                .post(apiPrefix + '/auth/register')
                .send({
                    name: 'João Silva',
                    email: 'joao@test.com',
                    password: 'senha123'
                });

            expect(registerResponse.status).toBe(201);
            expect(registerResponse.body).toHaveProperty('message');

            // 2. Login
            const loginResponse = await request(app)
                .post(apiPrefix + '/auth/login')
                .send({
                    email: 'joao@test.com',
                    password: 'senha123'
                });

            expect(loginResponse.status).toBe(200);
            expect(loginResponse.body).toHaveProperty('accessToken');
            const token = loginResponse.body.accessToken;

            // 3. Criar primeira nota
            const createNote1 = await request(app)
                .post(apiPrefix + '/notes')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    title: 'Minha Primeira Nota',
                    content: 'Conteúdo da primeira nota',
                    color: '#FFE066'
                });

            expect(createNote1.status).toBe(201);
            expect(createNote1.body.note).toHaveProperty('id');
            const noteId1 = createNote1.body.note.id;

            // 4. Criar segunda nota
            const createNote2 = await request(app)
                .post(apiPrefix + '/notes')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    title: 'Segunda Nota',
                    content: 'Mais conteúdo',
                    color: '#FF6B6B'
                });

            expect(createNote2.status).toBe(201);

            // 5. Listar todas as notas
            const listResponse = await request(app)
                .get(apiPrefix + '/notes')
                .set('Authorization', `Bearer ${token}`);

            expect(listResponse.status).toBe(200);
            expect(listResponse.body.notes).toHaveLength(2);

            // 6. Atualizar primeira nota
            const updateResponse = await request(app)
                .put(apiPrefix + `/notes/${noteId1}`)
                .set('Authorization', `Bearer ${token}`)
                .send({
                    title: 'Título Atualizado',
                    content: 'Conteúdo Atualizado'
                });

            expect(updateResponse.status).toBe(200);
            expect(updateResponse.body.note.title).toBe('Título Atualizado');

            // 7. Soft delete da nota
            const deleteResponse = await request(app)
                .put(apiPrefix + `/notes/${noteId1}/delete`)
                .set('Authorization', `Bearer ${token}`);

            expect(deleteResponse.status).toBe(200);
            expect(deleteResponse.body.note.deleted).toBe(true);

            // 8. Restaurar nota
            const restoreResponse = await request(app)
                .put(apiPrefix + `/notes/${noteId1}/restore`)
                .set('Authorization', `Bearer ${token}`);

            expect(restoreResponse.status).toBe(200);
            expect(restoreResponse.body.note.deleted).toBe(false);
        });

        test('[E2E] Fluxo de Recuperação de Senha', async () => {
            // 1. Registrar usuário
            await request(app)
                .post(apiPrefix + '/auth/register')
                .send({
                    name: 'Maria',
                    email: 'maria@test.com',
                    password: 'senha123'
                });

            // 2. Solicitar código de recuperação
            const codeResponse = await request(app)
                .post(apiPrefix + '/auth/password-code')
                .send({ email: 'maria@test.com' });

            expect(codeResponse.status).toBe(200);

            // Recuperar código do Redis mock
            const storedCode = await mockRedisClient.get('resetCode:maria@test.com');
            expect(storedCode).toBeTruthy();

            // 3. Trocar senha com código
            const changeResponse = await request(app)
                .post(apiPrefix + '/auth/change-password')
                .send({
                    email: 'maria@test.com',
                    code: storedCode,
                    password: 'novaSenha456'
                });

            expect(changeResponse.status).toBe(200);

            // 4. Login com nova senha
            const loginResponse = await request(app)
                .post(apiPrefix + '/auth/login')
                .send({
                    email: 'maria@test.com',
                    password: 'novaSenha456'
                });

            expect(loginResponse.status).toBe(200);
            expect(loginResponse.body).toHaveProperty('accessToken');
        });
    });

    describe('Testes de Segurança e Autorização', () => {
        let user1Token, user2Token, user1NoteId;

        beforeEach(async () => {
            // Criar usuário 1
            await request(app)
                .post(apiPrefix + '/auth/register')
                .send({ name: 'User1', email: 'user1@test.com', password: 'pass1' });

            const login1 = await request(app)
                .post(apiPrefix + '/auth/login')
                .send({ email: 'user1@test.com', password: 'pass1' });

            user1Token = login1.body.accessToken;

            // Criar nota do usuário 1
            const note1 = await request(app)
                .post(apiPrefix + '/notes')
                .set('Authorization', `Bearer ${user1Token}`)
                .send({ title: 'Nota User1', content: 'Privada' });

            user1NoteId = note1.body.note.id;

            // Criar usuário 2
            await request(app)
                .post(apiPrefix + '/auth/register')
                .send({ name: 'User2', email: 'user2@test.com', password: 'pass2' });

            const login2 = await request(app)
                .post(apiPrefix + '/auth/login')
                .send({ email: 'user2@test.com', password: 'pass2' });

            user2Token = login2.body.accessToken;
        });

        test('[Segurança] Usuário 2 não deve acessar notas do Usuário 1', async () => {
            const listResponse = await request(app)
                .get(apiPrefix + '/notes')
                .set('Authorization', `Bearer ${user2Token}`);

            expect(listResponse.body.notes).toHaveLength(0);
        });

        test('[Segurança] Usuário 2 não deve atualizar nota do Usuário 1', async () => {
            const updateResponse = await request(app)
                .put(apiPrefix + `/notes/${user1NoteId}`)
                .set('Authorization', `Bearer ${user2Token}`)
                .send({ title: 'Tentativa de hack' });

            expect(updateResponse.status).toBe(403);
        });

        test('[Segurança] Usuário 2 não deve deletar nota do Usuário 1', async () => {
            const deleteResponse = await request(app)
                .put(apiPrefix + `/notes/${user1NoteId}/delete`)
                .set('Authorization', `Bearer ${user2Token}`);

            expect(deleteResponse.status).toBe(403);
        });

        test('[Segurança] Requisição sem token deve ser rejeitada', async () => {
            const response = await request(app)
                .post(apiPrefix + '/notes')
                .send({ title: 'Test', content: 'Test' });

            expect(response.status).toBe(401);
        });

        test('[Segurança] Token inválido deve ser rejeitado', async () => {
            const response = await request(app)
                .get(apiPrefix + '/notes')
                .set('Authorization', 'Bearer tokeninvalido123');

            expect(response.status).toBe(401);
        });
    });

    describe('Validação de Dados e Casos Limite', () => {
        let token;

        beforeEach(async () => {
            await request(app)
                .post(apiPrefix + '/auth/register')
                .send({ name: 'Test', email: 'test@test.com', password: 'pass' });

            const login = await request(app)
                .post(apiPrefix + '/auth/login')
                .send({ email: 'test@test.com', password: 'pass' });

            token = login.body.accessToken;
        });

        test('[Validação] Criar nota sem título deve falhar', async () => {
            const response = await request(app)
                .post(apiPrefix + '/notes')
                .set('Authorization', `Bearer ${token}`)
                .send({ content: 'Conteúdo sem título' });

            expect(response.status).toBe(400);
        });

        test('[Validação] Atualizar nota inexistente deve retornar 404', async () => {
            const response = await request(app)
                .put(apiPrefix + '/notes/99999')
                .set('Authorization', `Bearer ${token}`)
                .send({ title: 'Novo título' });

            expect(response.status).toBe(404);
        });

        test('[Validação] Reordenar com formato inválido deve falhar', async () => {
            const response = await request(app)
                .put(apiPrefix + '/notes/reorder')
                .set('Authorization', `Bearer ${token}`)
                .send({ notes: 'invalid format' });

            expect(response.status).toBe(400);
        });

        test('[Email Duplicado] Registrar com email existente deve falhar', async () => {
            const response = await request(app)
                .post(apiPrefix + '/auth/register')
                .send({ name: 'Outro', email: 'test@test.com', password: 'pass' });

            expect(response.status).toBe(204);
        });
    });
});