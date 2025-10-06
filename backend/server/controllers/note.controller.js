require('dotenv').config({ path: '.env' });

const Note = require('../models/sequelize/note.model');
const redisClient = require('../../config/redis')

/**
 * Controller de Criação de Notas
 * - Recebe dados da nota (título, conteúdo, userId)
 * - Cria a nota no banco
 * - Retorna mensagem de sucesso ou erro se a nota já existir
 */
exports.create = async (req, res) => {
    try {
        let token = req.headers['authorization'];
        if (!token) {
            return res.status(401).json({ error: 'Token de autenticação não fornecido.' });
        }
        token = token.replace('Bearer ', '');

        // Verifica se o token está na blacklist (logout)
        const isBlacklisted = await redisClient.get(`bl_${token}`);
        if (isBlacklisted) {
            return res.status(401).json({ error: 'Token inválido ou expirado.' });
        }

        const decoded = require("jsonwebtoken").verify(token, process.env.JWT_SECURITY_PASS);
        if (!decoded) {
            return res.status(401).json({ error: 'Token inválido ou expirado.' });
        }

        const userId = decoded.id;
        const { title, content } = req.body;

        if (!title || !content || !userId) {
            return res.status(400).json({ error: 'Campos "título", "conteúdo" e "userId" são obrigatórios.' });
        }

        const newNote = await Note.create({
            title: title,
            content: content,
            user_id: userId
        });

        return res.status(201).json({ message: "Nota criada com sucesso.", note: newNote });
    } catch (error) {
        console.error('Erro ao criar nota:', error);
        return res.status(500).json({ error: 'Erro interno do servidor.' });
    }   
};

exports.getAll = async (req, res) => {
    try {
        const { userId } = req.params;
        const notes = await Note.findAll({ where: { userId } });
        return res.status(200).json({ notes });
    } catch (error) {
        console.error('Erro ao buscar notas:', error);
        return res.status(500).json({ error: 'Erro interno do servidor.' });
    }
};


exports.update = async (req, res) => {
    try {
        let token = req.headers['authorization'];
        if (!token) {
            return res.status(401).json({ error: 'Token de autenticação não fornecido.' });
        }
        token = token.replace('Bearer ', '');
        
        // Verifica se o token está na blacklist (logout)
        const isBlacklisted = await redisClient.get(`bl_${token}`);
        if (isBlacklisted) {
            return res.status(401).json({ error: 'Token inválido ou expirado.' });
        }

        const decoded = require("jsonwebtoken").verify(token, process.env.JWT_SECURITY_PASS);
        if (!decoded) {
            return res.status(401).json({ error: 'Token inválido ou expirado.' });
        }
        
        const { id } = req.params;
        const { title, content } = req.body;
        const note = await Note.findByPk(id);
        
        if (!note) {
            return res.status(404).json({ error: 'Nota não encontrada.' });
        }

        const userId = decoded.id;
        if (note.user_id !== userId) {
            return res.status(403).json({ error: 'Você não tem permissão para atualizar esta nota.' });
        }

        note.title = title || note.title;
        note.content = content || note.content;
        note.updated_at = new Date();
        
        await note.save();  
        return res.status(200).json({ message: 'Nota atualizada com sucesso.', note });
    } catch (error) {
        console.error('Erro ao atualizar nota:', error);
        return res.status(500).json({ error: 'Erro interno do servidor.' });
    }
};

exports.delete = async (req, res) => { //Adiciona uma flag de deletada na nota
    try {
        let token = req.headers['authorization'];
        if (!token) {
            return res.status(401).json({ error: 'Token de autenticação não fornecido.' });
        }
        token = token.replace('Bearer ', '');

        // Verifica se o token está na blacklist (logout)
        const isBlacklisted = await redisClient.get(`bl_${token}`);
        if (isBlacklisted) {
            return res.status(401).json({ error: 'Token inválido ou expirado.' });
        }

        const decoded = require("jsonwebtoken").verify(token, process.env.JWT_SECURITY_PASS);
        if (!decoded) {
            return res.status(401).json({ error: 'Token inválido ou expirado.' });
        }

        const { id } = req.params;
        const note = await Note.findByPk(id);

        if (!note) {
            return res.status(404).json({ error: 'Nota não encontrada.' });
        }

        const userId = decoded.id;
        if (note.user_id !== userId) {
            return res.status(403).json({ error: 'Você não tem permissão para deletar esta nota.' });
        }

        note.deleted = true;
        note.deleted_at = new Date();

        await note.save();  
        return res.status(200).json({ message: 'Nota deletada com sucesso.', note });
    } catch (error) {
        console.error('Erro ao deletar nota:', error);
        return res.status(500).json({ error: 'Erro interno do servidor.' });
    }
};