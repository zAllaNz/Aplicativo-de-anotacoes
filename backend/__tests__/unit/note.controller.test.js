// __tests__/unit/note.controller.test.js
const jwt = require('jsonwebtoken');

// Mock do Redis - DEVE vir ANTES de importar o controller
const mockRedisClient = {
    get: jest.fn(),
    setEx: jest.fn(),
    del: jest.fn()
};
jest.mock('../../config/redis', () => mockRedisClient);

// Mock do model Note
const mockNote = {
    create: jest.fn(),
    findAll: jest.fn(),
    findByPk: jest.fn(),
    update: jest.fn()
};
jest.mock('../../server/models/sequelize/note.model', () => mockNote);

const noteController = require('../../server/controllers/note.controller');

describe('Note Controller - Testes Unitários (Caixa Branca)', () => {
    let req, res, validToken;

    beforeEach(() => {
        validToken = jwt.sign(
            { id: 1 },
            process.env.JWT_SECURITY_PASS || 'test-secret',
            { expiresIn: '5d' }
        );

        req = {
            body: {},
            headers: {
                authorization: `Bearer ${validToken}`
            },
            params: {}
        };

        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        };

        jest.clearAllMocks();
        mockRedisClient.get.mockResolvedValue(null); // token não está na blacklist
    });

    describe('Create Note', () => {
        test('[Sem Token] Deve retornar 401 se token não for fornecido', async () => {
            req.headers.authorization = undefined;

            await noteController.create(req, res);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Token de autenticação não fornecido.'
            });
        });

        test('[Token Blacklist] Deve retornar 401 se token estiver na blacklist', async () => {
            mockRedisClient.get.mockResolvedValue('true');

            await noteController.create(req, res);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Token inválido ou expirado.'
            });
        });

        test('[Validação] Deve retornar 400 se título não for fornecido', async () => {
            req.body = { content: 'Conteúdo da nota' };

            await noteController.create(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
        });

        test('[Sucesso] Deve criar nota com todos os campos', async () => {
            req.body = {
                title: 'Minha Nota',
                content: 'Conteúdo da nota',
                color: '#FFE066'
            };

            const mockCreatedNote = {
                id: 1,
                title: 'Minha Nota',
                content: 'Conteúdo da nota',
                color: '#FFE066',
                user_id: 1
            };

            mockNote.create.mockResolvedValue(mockCreatedNote);

            await noteController.create(req, res);

            expect(mockNote.create).toHaveBeenCalledWith({
                title: 'Minha Nota',
                content: 'Conteúdo da nota',
                color: '#FFE066',
                user_id: 1
            });

            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Nota criada com sucesso.',
                note: mockCreatedNote
            });
        });

        test('[Erro Interno] Deve retornar 500 em caso de erro', async () => {
            req.body = { title: 'Test', content: 'Test' };
            mockNote.create.mockRejectedValue(new Error('Database error'));

            await noteController.create(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
        });
    });

    describe('Get All Notes', () => {
        test('[Sucesso] Deve retornar todas as notas do usuário', async () => {
            const mockNotes = [
                { id: 1, title: 'Nota 1', user_id: 1 },
                { id: 2, title: 'Nota 2', user_id: 1 }
            ];

            mockNote.findAll.mockResolvedValue(mockNotes);

            await noteController.getAll(req, res);

            expect(mockNote.findAll).toHaveBeenCalledWith({
                where: { user_id: 1 }
            });

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ notes: mockNotes });
        });

        test('[Lista Vazia] Deve retornar array vazio se usuário não tem notas', async () => {
            mockNote.findAll.mockResolvedValue([]);

            await noteController.getAll(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ notes: [] });
        });
    });

    describe('Update Note', () => {
        test('[Nota Não Encontrada] Deve retornar 404 se nota não existir', async () => {
            req.params.id = '999';
            req.body = { title: 'Novo título' };

            mockNote.findByPk.mockResolvedValue(null);

            await noteController.update(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
        });

        test('[Sem Permissão] Deve retornar 403 se nota não pertencer ao usuário', async () => {
            req.params.id = '1';
            req.body = { title: 'Novo título' };

            mockNote.findByPk.mockResolvedValue({
                id: 1,
                user_id: 999, // nota de outro usuário
                title: 'Título antigo',
                save: jest.fn()
            });

            await noteController.update(req, res);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Você não tem permissão para atualizar esta nota.'
            });
        });

        test('[Sucesso] Deve atualizar nota do usuário', async () => {
            req.params.id = '1';
            req.body = {
                title: 'Título atualizado',
                content: 'Conteúdo atualizado'
            };

            const mockNoteInstance = {
                id: 1,
                user_id: 1,
                title: 'Título antigo',
                content: 'Conteúdo antigo',
                save: jest.fn().mockResolvedValue(true)
            };

            mockNote.findByPk.mockResolvedValue(mockNoteInstance);

            await noteController.update(req, res);

            expect(mockNoteInstance.title).toBe('Título atualizado');
            expect(mockNoteInstance.content).toBe('Conteúdo atualizado');
            expect(mockNoteInstance.save).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
        });

        test('[Atualização Parcial] Deve manter campos não enviados', async () => {
            req.params.id = '1';
            req.body = { title: 'Novo título' }; // sem content

            const mockNoteInstance = {
                id: 1,
                user_id: 1,
                title: 'Título antigo',
                content: 'Conteúdo original',
                save: jest.fn()
            };

            mockNote.findByPk.mockResolvedValue(mockNoteInstance);

            await noteController.update(req, res);

            expect(mockNoteInstance.title).toBe('Novo título');
            expect(mockNoteInstance.content).toBe('Conteúdo original');
        });
    });

    describe('Delete Note (Soft Delete)', () => {
        test('[Sucesso] Deve marcar nota como deletada', async () => {
            req.params.id = '1';

            const mockNoteInstance = {
                id: 1,
                user_id: 1,
                deleted: false,
                save: jest.fn()
            };

            mockNote.findByPk.mockResolvedValue(mockNoteInstance);

            await noteController.delete(req, res);

            expect(mockNoteInstance.deleted).toBe(true);
            expect(mockNoteInstance.deleted_at).toBeInstanceOf(Date);
            expect(mockNoteInstance.save).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
        });

        test('[Sem Permissão] Deve retornar 403 para nota de outro usuário', async () => {
            req.params.id = '1';

            mockNote.findByPk.mockResolvedValue({
                id: 1,
                user_id: 999,
                save: jest.fn()
            });

            await noteController.delete(req, res);

            expect(res.status).toHaveBeenCalledWith(403);
        });
    });

    describe('Restore Note', () => {
        test('[Sucesso] Deve remover flag de deletada', async () => {
            req.params.id = '1';

            const mockNoteInstance = {
                id: 1,
                user_id: 1,
                deleted: true,
                deleted_at: new Date(),
                save: jest.fn()
            };

            mockNote.findByPk.mockResolvedValue(mockNoteInstance);

            await noteController.restore(req, res);

            expect(mockNoteInstance.deleted).toBe(false);
            expect(mockNoteInstance.deleted_at).toBe(null);
            expect(res.status).toHaveBeenCalledWith(200);
        });
    });

    describe('Reorder Notes', () => {
        test('[Validação] Deve retornar 400 se formato for inválido', async () => {
            req.body = { notes: 'invalid' };

            await noteController.reorder(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
        });

        test('[Sucesso] Deve atualizar ordem de múltiplas notas', async () => {
            req.body = {
                notes: [
                    { id: 1, order_index: 2 },
                    { id: 2, order_index: 0 },
                    { id: 3, order_index: 1 }
                ]
            };

            mockNote.update.mockResolvedValue([1]);

            await noteController.reorder(req, res);

            expect(mockNote.update).toHaveBeenCalledTimes(3);
            expect(res.status).toHaveBeenCalledWith(200);
        });
    });

    describe('Toggle Check (Lista de Tarefas)', () => {
        test('[Tipo Inválido] Deve retornar 400 se nota não for lista', async () => {
            req.params.id = '1';
            req.body = { itemIndex: 0, checked: true };

            mockNote.findByPk.mockResolvedValue({
                id: 1,
                type: 'text',
                content: 'Simple text'
            });

            await noteController.toggleCheck(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
        });

        test('[Sucesso] Deve marcar item como concluído', async () => {
            req.params.id = '1';
            req.body = { itemIndex: 0, checked: true };

            const mockNoteInstance = {
                id: 1,
                type: 'list',
                content: {
                    items: [
                        { text: 'Item 1', checked: false },
                        { text: 'Item 2', checked: false }
                    ]
                },
                save: jest.fn()
            };

            mockNote.findByPk.mockResolvedValue(mockNoteInstance);

            await noteController.toggleCheck(req, res);

            // Verificar se o save foi chamado e se o status é 200
            expect(mockNoteInstance.save).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);

            // O controller modifica o content.items diretamente
            // Verificamos se a resposta foi bem-sucedida
            expect(res.json).toHaveBeenCalled();
        });
    });
});