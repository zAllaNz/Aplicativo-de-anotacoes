const express = require("express");
const router = express.Router();
const noteController = require("../controllers/note.controller");

/**
 * @swagger
 * tags:
 *   name: Notes
 *   description: Rotas de criação, listagem, atualização e exclusão de notas
 */

/**
 * @swagger
 * /notes:
 *   post:
 *     summary: Cria uma nova nota
 *     description: Cria uma nota associada ao usuário autenticado. Requer token JWT.
 *     tags: [Notes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - content
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Minha primeira nota"
 *               content:
 *                 type: string
 *                 example: "Conteúdo da minha nota"
 *     responses:
 *       201:
 *         description: Nota criada com sucesso
 *       400:
 *         description: Campos obrigatórios faltando
 *       401:
 *         description: Token inválido ou ausente
 *       500:
 *         description: Erro interno do servidor
*/
router.post("/", noteController.create);

/**
 * @swagger
 * /notes/{userId}:
 *   get:
 *     summary: Lista todas as notas de um usuário
 *     description: Retorna todas as notas pertencentes a um usuário específico.
 *     tags: [Notes]
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID do usuário
 *     responses:
 *       200:
 *         description: Lista de notas retornada com sucesso
 *       404:
 *         description: Nenhuma nota encontrada
 *       500:
 *         description: Erro interno do servidor
 */
router.get("/:userId", noteController.getAll);

/**
 * @swagger
 * /notes/{id}:
 *   put:
 *     summary: Atualiza uma nota existente
 *     description: Atualiza o título e/ou conteúdo de uma nota. Requer token JWT.
 *     tags: [Notes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID da nota
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Título atualizado"
 *               content:
 *                 type: string
 *                 example: "Novo conteúdo da nota"
 *     responses:
 *       200:
 *         description: Nota atualizada com sucesso
 *       401:
 *         description: Token inválido ou ausente
 *       403:
 *         description: Usuário não tem permissão
 *       404:
 *         description: Nota não encontrada
 *       500:
 *         description: Erro interno do servidor
*/
router.put("/:id", noteController.update);

/**
 * @swagger
 * /notes/delete/{id}:
 *   put:
 *     summary: Deleta uma nota (soft delete)
 *     description: Marca uma nota como deletada, sem removê-la definitivamente. Requer token JWT.
 *     tags: [Notes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID da nota
 *     responses:
 *       200:
 *         description: Nota deletada com sucesso
 *       401:
 *         description: Token inválido ou ausente
 *       403:
 *         description: Usuário não tem permissão
 *       404:
 *         description: Nota não encontrada
 *       500:
 *         description: Erro interno do servidor
 */
router.put("/delete/:id", noteController.delete);

/**
 * @swagger
 * /notes/restore/{id}:
 *   put:
 *     summary: Restaura uma nota deletada
 *     description: Remove a flag de exclusão da nota (soft delete). Requer token JWT.
 *     tags: [Notes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID da nota
 *     responses:
 *       200:
 *         description: Nota restaurada com sucesso
 *       401:
 *         description: Token inválido ou ausente
 *       403:
 *         description: Usuário não tem permissão
 *       404:
 *         description: Nota não encontrada
 *       500:
 *         description: Erro interno do servidor
 */
router.put("/restore/:id", noteController.restore);

/**
 * @swagger
 * /notes/delete/{id}/permanent:
 *   delete:
 *     summary: Deleta uma nota permanentemente
 *     description: Remove completamente a nota do banco de dados (não reversível).
 *     tags: [Notes]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID da nota
 *     responses:
 *       200:
 *         description: Nota deletada permanentemente com sucesso
 *       404:
 *         description: Nota não encontrada
 *       500:
 *         description: Erro interno do servidor
 */
router.delete("/delete/:id/permanent", noteController.deletePermanent);


module.exports = router;