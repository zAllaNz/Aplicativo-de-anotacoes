const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Rotas de autenticação e gerenciamento de conta
 */

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login do usuário
 *     description: Faz login do usuário com email e senha e retorna um token JWT.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: usuario@email.com
 *               password:
 *                 type: string
 *                 example: senha123
 *     responses:
 *       200:
 *         description: Login bem-sucedido
 *       204:
 *         description: Credenciais incorretas
 *       400:
 *         description: Campos obrigatórios faltando
 */
router.post("/login", authController.login);

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Registro de usuário
 *     description: Cria um novo usuário criptografando a senha.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: João
 *               email:
 *                 type: string
 *                 example: joao@email.com
 *               password:
 *                 type: string
 *                 example: senha123
 *     responses:
 *       201:
 *         description: Usuário registrado com sucesso
 *       204:
 *         description: E-mail já em uso
 */
router.post("/register", authController.register);

/**
 * @swagger
 * /auth/change-password:
 *   post:
 *     summary: Alterar senha do usuário
 *     description: Permite trocar a senha com base em um código enviado por e-mail (armazenado no Redis).
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - code
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: usuario@email.com
 *               code:
 *                 type: string
 *                 example: "123456"
 *               password:
 *                 type: string
 *                 example: novaSenha123
 *     responses:
 *       200:
 *         description: Senha alterada com sucesso
 *       400:
 *         description: Código inválido ou expirado
 */
router.post("/change-password", authController.changePassword);

/**
 * @swagger
 * /auth/password-code:
 *   post:
 *     summary: Solicitar código de redefinição de senha
 *     description: Gera um código de 6 dígitos, armazena no Redis e envia por e-mail para o usuário.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 example: usuario@email.com
 *     responses:
 *       200:
 *         description: Código enviado por e-mail
 *       400:
 *         description: Email não informado
 */
router.post("/password-code", authController.passwordCode);

module.exports = router;
