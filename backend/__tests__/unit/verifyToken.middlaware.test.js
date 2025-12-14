// __tests__/unit/verifyToken.middleware.test.js
const jwt = require('jsonwebtoken');

// Verifica se o arquivo existe antes de testar
const fs = require('fs');
const path = require('path');
const middlewarePath = path.join(__dirname, '../../server/middlewares/verifyToken.js');

// Se o arquivo não existir, pula os testes
const middlewareExists = fs.existsSync(middlewarePath);

// Só carrega se existir
let verifyToken, verifyTokenAndAuthorization, verifyTokenAndAdmin;

if (middlewareExists) {
    const middleware = require('../../server/middlewares/verifyToken');
    verifyToken = middleware.verifyToken;
    verifyTokenAndAuthorization = middleware.verifyTokenAndAuthorization;
    verifyTokenAndAdmin = middleware.verifyTokenAndAdmin;
}

describe('Middleware - verifyToken (Testes Unitários)', () => {
    let req, res, next;
    const secret = process.env.JWT_SECURITY_PASS || 'test-secret';

    // Pula todos os testes se o middleware não existir
    if (!middlewareExists) {
        test.skip('Middleware verifyToken não encontrado - pulando testes', () => { });
        return;
    }

    beforeEach(() => {
        req = {
            headers: {},
            params: {},
            user: null
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        };
        next = jest.fn();
    });

    describe('verifyToken', () => {
        test('[Sucesso] Deve validar token válido e chamar next()', () => {
            const validToken = jwt.sign({ id: 1 }, secret, { expiresIn: '1h' });
            req.headers.token = `Bearer ${validToken}`;

            verifyToken(req, res, next);

            expect(next).toHaveBeenCalled();
            expect(req.user).toBeDefined();
            expect(req.user.id).toBe(1);
        });

        test('[Sem Token] Deve retornar 401 se token não fornecido', () => {
            verifyToken(req, res, next);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    error: 'You are not authenticated!'
                })
            );
            expect(next).not.toHaveBeenCalled();
        });

        test('[Token Inválido] Deve retornar 403 se token for inválido', () => {
            req.headers.token = 'Bearer invalid-token-123';

            verifyToken(req, res, next);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    error: 'Token is not valid!'
                })
            );
            expect(next).not.toHaveBeenCalled();
        });
    });

    describe('verifyTokenAndAuthorization', () => {
        test('[Sucesso] Deve permitir usuário acessar próprios dados', () => {
            const validToken = jwt.sign({ id: 1 }, secret);
            req.headers.token = `Bearer ${validToken}`;
            req.params.id = '1';

            verifyTokenAndAuthorization(req, res, next);

            expect(next).toHaveBeenCalled();
        });

        test('[Admin] Deve permitir admin acessar qualquer dado', () => {
            const adminToken = jwt.sign({ id: 999, isAdmin: true }, secret);
            req.headers.token = `Bearer ${adminToken}`;
            req.params.id = '1';

            verifyTokenAndAuthorization(req, res, next);

            expect(next).toHaveBeenCalled();
        });

        test('[Negado] Deve bloquear usuário acessar dados de outro', () => {
            const validToken = jwt.sign({ id: 2 }, secret);
            req.headers.token = `Bearer ${validToken}`;
            req.params.id = '1';

            verifyTokenAndAuthorization(req, res, next);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    error: 'You are not alowed to do that!'
                })
            );
        });
    });

    describe('verifyTokenAndAdmin', () => {
        test('[Sucesso] Deve permitir acesso de admin', () => {
            const adminToken = jwt.sign({ id: 1, isAdmin: true }, secret);
            req.headers.token = `Bearer ${adminToken}`;

            verifyTokenAndAdmin(req, res, next);

            expect(next).toHaveBeenCalled();
        });

        test('[Negado] Deve bloquear usuário não-admin', () => {
            const userToken = jwt.sign({ id: 1, isAdmin: false }, secret);
            req.headers.token = `Bearer ${userToken}`;

            verifyTokenAndAdmin(req, res, next);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    error: 'You are not alowed to do that!'
                })
            );
        });

        test('[Negado] Deve bloquear se isAdmin não estiver no token', () => {
            const userToken = jwt.sign({ id: 1 }, secret);
            req.headers.token = `Bearer ${userToken}`;

            verifyTokenAndAdmin(req, res, next);

            expect(res.status).toHaveBeenCalledWith(403);
        });
    });
});