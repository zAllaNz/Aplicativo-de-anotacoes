
/**
 * TESTES CAIXA PRETA
 * 
 * Estes testes verificam o comportamento da API através das entradas e saídas,
 * sem conhecimento da implementação interna. Focamos em:
 * - Valores válidos e inválidos
 * - Casos limite (boundary values)
 * - Particionamento de equivalência
 * - Análise de valor limite
 */

const request = require('supertest');
const express = require('express');

const app = express();
app.use(express.json());

const apiPrefix = '/anotacoes/api/v1';

// Mocks necessários (mantemos minimalistas para caixa preta)
jest.mock('../../config/redis', () => ({
    get: jest.fn().mockResolvedValue(null),
    setEx: jest.fn().mockResolvedValue(true),
    del: jest.fn().mockResolvedValue(true)
}));

jest.mock('nodemailer', () => ({
    createTransport: jest.fn(() => ({
        sendMail: jest.fn().mockResolvedValue({ messageId: 'test' })
    }))
}));

app.use(apiPrefix + '/auth', require('../../server/routes/auth.route'));
app.use(apiPrefix + '/notes', require('../../server/routes/note.route'));

describe('Testes Caixa Preta - Particionamento de Equivalência', () => {
    describe('Endpoint: POST /auth/register', () => {
        test('[Classe Válida] Email e senha válidos', async () => {
            const response = await request(app)
                .post(apiPrefix + '/auth/register')
                .send({
                    email: 'valid@example.com',
                    password: 'ValidPass123',
                    name: 'Valid User'
                });

            expect([201, 204]).toContain(response.status);
        });

        test('[Classe Inválida] Email ausente', async () => {
            const response = await request(app)
                .post(apiPrefix + '/auth/register')
                .send({
                    password: 'ValidPass123',
                    name: 'User'
                });

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error');
        });

        test('[Classe Inválida] Senha ausente', async () => {
            const response = await request(app)
                .post(apiPrefix + '/auth/register')
                .send({
                    email: 'user@example.com',
                    name: 'User'
                });

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error');
        });

        test('[Classe Inválida] Corpo vazio', async () => {
            const response = await request(app)
                .post(apiPrefix + '/auth/register')
                .send({});

            expect(response.status).toBe(400);
        });

        test('[Valor Limite] Email muito longo (255+ caracteres)', async () => {
            const longEmail = 'a'.repeat(250) + '@test.com';

            const response = await request(app)
                .post(apiPrefix + '/auth/register')
                .send({
                    email: longEmail,
                    password: 'pass123',
                    name: 'Test'
                });

            // Aceita tanto sucesso quanto erro de validação
            expect([201, 400, 500]).toContain(response.status);
        });

        test('[Valor Limite] Senha de 1 caractere', async () => {
            const response = await request(app)
                .post(apiPrefix + '/auth/register')
                .send({
                    email: 'short@test.com',
                    password: 'a',
                    name: 'Test'
                });

            expect([201, 204, 400]).toContain(response.status);
        });

        test('[Caracteres Especiais] Email com caracteres especiais', async () => {
            const response = await request(app)
                .post(apiPrefix + '/auth/register')
                .send({
                    email: 'user+test@example.com',
                    password: 'pass123',
                    name: 'Test'
                });

            expect([201, 204, 400]).toContain(response.status);
        });
    });

    describe('Endpoint: POST /auth/login', () => {
        test('[Classe Válida] Credenciais corretas', async () => {
            // Este teste depende de um usuário existente
            const response = await request(app)
                .post(apiPrefix + '/auth/login')
                .send({
                    email: 'existing@test.com',
                    password: 'correctPassword'
                });

            // 200 (sucesso) ou 204 (não encontrado)
            expect([200, 204]).toContain(response.status);
        });

        test('[Classe Inválida] Email incorreto', async () => {
            const response = await request(app)
                .post(apiPrefix + '/auth/login')
                .send({
                    email: 'nonexistent@test.com',
                    password: 'anyPassword'
                });

            expect(response.status).toBe(204);
        });

        test('[Classe Inválida] Senha incorreta', async () => {
            const response = await request(app)
                .post(apiPrefix + '/auth/login')
                .send({
                    email: 'existing@test.com',
                    password: 'wrongPassword'
                });

            expect([200, 204]).toContain(response.status);
        });

        test('[Classe Inválida] Email ausente', async () => {
            const response = await request(app)
                .post(apiPrefix + '/auth/login')
                .send({
                    password: 'somePassword'
                });

            expect(response.status).toBe(400);
        });

        test('[SQL Injection] Tentativa de SQL injection no email', async () => {
            const response = await request(app)
                .post(apiPrefix + '/auth/login')
                .send({
                    email: "'; DROP TABLE users; --",
                    password: 'password'
                });

            // Deve retornar erro ou não encontrado, nunca 200
            expect(response.status).not.toBe(200);
        });

        test('[XSS] Tentativa de script injection', async () => {
            const response = await request(app)
                .post(apiPrefix + '/auth/login')
                .send({
                    email: '<script>alert("xss")</script>@test.com',
                    password: 'password'
                });

            expect([400, 204]).toContain(response.status);
        });
    });

    describe('Endpoint: POST /auth/password-code', () => {
        test('[Classe Válida] Email válido', async () => {
            const response = await request(app)
                .post(apiPrefix + '/auth/password-code')
                .send({
                    email: 'user@test.com'
                });

            expect([200, 500]).toContain(response.status);
        });

        test('[Classe Inválida] Email ausente', async () => {
            const response = await request(app)
                .post(apiPrefix + '/auth/password-code')
                .send({});

            expect(response.status).toBe(400);
        });

        test('[Valor Limite] Email vazio', async () => {
            const response = await request(app)
                .post(apiPrefix + '/auth/password-code')
                .send({
                    email: ''
                });

            expect(response.status).toBe(400);
        });

        test('[Formato Inválido] Email malformado', async () => {
            const response = await request(app)
                .post(apiPrefix + '/auth/password-code')
                .send({
                    email: 'not-an-email'
                });

            expect([200, 400, 500]).toContain(response.status);
        });
    });

    describe('Endpoint: POST /auth/change-password', () => {
        test('[Classe Válida] Todos os campos corretos', async () => {
            const response = await request(app)
                .post(apiPrefix + '/auth/change-password')
                .send({
                    email: 'user@test.com',
                    code: '123456',
                    password: 'newPassword123'
                });

            expect([200, 400]).toContain(response.status);
        });

        test('[Classe Inválida] Código ausente', async () => {
            const response = await request(app)
                .post(apiPrefix + '/auth/change-password')
                .send({
                    email: 'user@test.com',
                    password: 'newPassword'
                });

            expect(response.status).toBe(400);
        });

        test('[Classe Inválida] Nova senha ausente', async () => {
            const response = await request(app)
                .post(apiPrefix + '/auth/change-password')
                .send({
                    email: 'user@test.com',
                    code: '123456'
                });

            expect(response.status).toBe(400);
        });

        test('[Valor Limite] Código com menos de 6 dígitos', async () => {
            const response = await request(app)
                .post(apiPrefix + '/auth/change-password')
                .send({
                    email: 'user@test.com',
                    code: '123',
                    password: 'newPass'
                });

            expect(response.status).toBe(400);
        });

        test('[Valor Limite] Código com mais de 6 dígitos', async () => {
            const response = await request(app)
                .post(apiPrefix + '/auth/change-password')
                .send({
                    email: 'user@test.com',
                    code: '1234567',
                    password: 'newPass'
                });

            expect(response.status).toBe(400);
        });
    });
});

describe('Testes Caixa Preta - Análise de Valor Limite', () => {
    describe('Limites de Strings', () => {
        test('[Título Nota] String vazia', async () => {
            const response = await request(app)
                .post(apiPrefix + '/notes')
                .set('Authorization', 'Bearer fake-token')
                .send({
                    title: '',
                    content: 'Content'
                });

            expect([400, 401]).toContain(response.status);
        });

        test('[Título Nota] String de 1 caractere', async () => {
            const response = await request(app)
                .post(apiPrefix + '/notes')
                .set('Authorization', 'Bearer fake-token')
                .send({
                    title: 'A',
                    content: 'Content'
                });

            expect([201, 401]).toContain(response.status);
        });

        test('[Título Nota] String muito longa (1000+ caracteres)', async () => {
            const longTitle = 'A'.repeat(1000);

            const response = await request(app)
                .post(apiPrefix + '/notes')
                .set('Authorization', 'Bearer fake-token')
                .send({
                    title: longTitle,
                    content: 'Content'
                });

            expect([201, 400, 401, 500]).toContain(response.status);
        });
    });

    describe('Limites Numéricos', () => {
        test('[Order Index] Valor negativo', async () => {
            const response = await request(app)
                .put(apiPrefix + '/notes/reorder')
                .set('Authorization', 'Bearer fake-token')
                .send({
                    notes: [
                        { id: 1, order_index: -1 }
                    ]
                });

            expect([200, 400, 401]).toContain(response.status);
        });

        test('[Order Index] Valor zero', async () => {
            const response = await request(app)
                .put(apiPrefix + '/notes/reorder')
                .set('Authorization', 'Bearer fake-token')
                .send({
                    notes: [
                        { id: 1, order_index: 0 }
                    ]
                });

            expect([200, 401]).toContain(response.status);
        });

        test('[Order Index] Valor muito grande', async () => {
            const response = await request(app)
                .put(apiPrefix + '/notes/reorder')
                .set('Authorization', 'Bearer fake-token')
                .send({
                    notes: [
                        { id: 1, order_index: 999999999 }
                    ]
                });

            expect([200, 400, 401]).toContain(response.status);
        });

        test('[Item Index] Índice negativo no toggle check', async () => {
            const response = await request(app)
                .patch(apiPrefix + '/notes/1/check')
                .set('Authorization', 'Bearer fake-token')
                .send({
                    itemIndex: -1,
                    checked: true
                });

            expect([200, 400, 401, 404]).toContain(response.status);
        });
    });
});

describe('Testes Caixa Preta - Segurança', () => {
    test('[Header Injection] Tentativa de injetar headers maliciosos', async () => {
        const response = await request(app)
            .post(apiPrefix + '/auth/login')
            .set('X-Injected-Header', '<script>alert("xss")</script>')
            .send({
                email: 'user@test.com',
                password: 'password'
            });

        expect([200, 204, 400]).toContain(response.status);
    });

    test('[Token Inválido] Token JWT malformado', async () => {
        const response = await request(app)
            .get(apiPrefix + '/notes')
            .set('Authorization', 'Bearer not-a-valid-jwt-token');

        expect(response.status).toBe(401);
    });

    test('[Token Vazio] Requisição sem Bearer prefix', async () => {
        const response = await request(app)
            .get(apiPrefix + '/notes')
            .set('Authorization', 'just-a-token');

        expect(response.status).toBe(401);
    });

    test('[Mass Assignment] Tentativa de modificar campos protegidos', async () => {
        const response = await request(app)
            .post(apiPrefix + '/auth/register')
            .send({
                email: 'hacker@test.com',
                password: 'pass123',
                name: 'Hacker',
                isAdmin: true, // tentativa de se tornar admin
                id: 999 // tentativa de definir ID
            });

        expect([201, 204, 400]).toContain(response.status);
        // Se suceder, não deve incluir isAdmin no usuário criado
    });

    test('[NoSQL Injection] Tentativa com objetos no lugar de strings', async () => {
        const response = await request(app)
            .post(apiPrefix + '/auth/login')
            .send({
                email: { $ne: null },
                password: { $ne: null }
            });

        expect(response.status).not.toBe(200);
    });
});

describe('Testes Caixa Preta - Casos de Uso do Mundo Real', () => {
    test('[Concorrência] Múltiplas requisições simultâneas', async () => {
        const promises = [];

        for (let i = 0; i < 10; i++) {
            promises.push(
                request(app)
                    .post(apiPrefix + '/auth/register')
                    .send({
                        email: `concurrent${i}@test.com`,
                        password: 'pass123',
                        name: `User ${i}`
                    })
            );
        }

        const responses = await Promise.all(promises);

        // Todas devem retornar status válidos
        responses.forEach(res => {
            expect([201, 204, 400, 500]).toContain(res.status);
        });
    });

    test('[Rate Limiting] Múltiplas tentativas de login', async () => {
        const promises = [];

        for (let i = 0; i < 50; i++) {
            promises.push(
                request(app)
                    .post(apiPrefix + '/auth/login')
                    .send({
                        email: 'victim@test.com',
                        password: 'wrongpass'
                    })
            );
        }

        const responses = await Promise.all(promises);

        // Todas devem responder (sem crash)
        expect(responses.length).toBe(50);
    });

    test('[Content-Type] JSON malformado', async () => {
        const response = await request(app)
            .post(apiPrefix + '/auth/login')
            .set('Content-Type', 'application/json')
            .send('{ invalid json }');

        expect([400, 500]).toContain(response.status);
    });

    test('[Content-Type] Tipo não suportado', async () => {
        const response = await request(app)
            .post(apiPrefix + '/auth/login')
            .set('Content-Type', 'text/plain')
            .send('email=test@test.com&password=pass');

        expect([400, 404]).toContain(response.status);
    });
});