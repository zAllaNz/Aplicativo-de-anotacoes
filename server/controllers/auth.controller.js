require('dotenv').config({ path: '.env' });

const User = require('../models/sequelize/user.model');
const { Sequelize } = require('sequelize');
const CryptoJS = require("crypto-js");
const jwt = require("jsonwebtoken");

const nodemailer = require("nodemailer");
const redisClient = require('../../config/redis')

// Configuração do serviço de envio de e-mails (SMTP) com nodemailer
const transporter = nodemailer.createTransport({
    host: `${process.env.EMAIL_HOST}`,
    port: process.env.EMAIL_PORT,
    secure: false, // false = STARTTLS 
    auth: {
        user: `${process.env.EMAIL_NAME}`,
        pass: `${process.env.EMAIL_PASS}`,
    },
    tls: {
        rejectUnauthorized: false, // ignorando certificado inválido
    },
});

/**
 * Controller de Login
 * - Verifica se email e senha foram enviados
 * - Busca usuário pelo email no banco
 * - Descriptografa a senha salva e compara com a senha enviada
 * - Gera um token JWT válido por 5 dias
 * - Retorna os dados do usuário (sem senha) + token
 */
exports.login = async (req, res) => {
    try {
        if (!req.body || !req.body.email || !req.body.password) {
            return res.status(400).json({ error: 'Campos "email" e "password" são obrigatórios.' });
        }

        const user = await User.findOne({ where: { email: req.body.email } });

        if (!user) {
            return res.status(204).json({ error: "Credenciais incorretas. Verifique seu email e senha." });
        }

        // Descriptografa senha salva no banco
        const hashedPassword = CryptoJS.AES.decrypt(user.password, process.env.CRYPTO_SECURITY_PASS);
        const originalPassword = hashedPassword.toString(CryptoJS.enc.Utf8);

        if (originalPassword !== req.body.password) {
            return res.status(204).json({ error: "Credenciais incorretas. Verifique seu email e senha." });
        }

        // Cria token JWT com id do usuário
        const accessToken = jwt.sign(
            { id: user.id },
            process.env.JWT_SECURITY_PASS,
            { expiresIn: "5d" }
        );

        // Remove a senha do objeto de retorno
        const userJson = JSON.parse(JSON.stringify(user.dataValues));
        const { password, ...others } = userJson;

        res.status(200).json({ ...others, accessToken });

    } catch (error) {
        res.status(500).json(error);
    }
};

/**
 * Controller de Registro
 * - Recebe dados do usuário (email, senha, nome, etc.)
 * - Criptografa a senha antes de salvar
 * - Cria registro no banco
 * - Retorna mensagem de sucesso ou erro se e-mail já estiver em uso
 */
exports.register = async (req, res) => {
    try {
        const { email, password, name, ...rest } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Campos "email" e "password" são obrigatórios.' });
        }

        // Criptografa senha antes de salvar
        const encryptedPassword = CryptoJS.AES.encrypt(
            password,
            process.env.CRYPTO_SECURITY_PASS
        ).toString();

        const user = await User.create({ email, password: encryptedPassword, name, ...rest });

        res.status(201).json({ message: "Usuário registrado com sucesso.", user });
    } catch (error) {
        if (error instanceof Sequelize.UniqueConstraintError) {
            res.status(204).json({ error: 'E-mail já está em uso.' });
        } else {
            res.status(500).json({ error: 'Erro interno do servidor.' });
            console.log(error)
        }
    }
};

/**
 * Controller de Alteração de Senha
 * - Recebe email, código de verificação e nova senha
 * - Verifica se o código existe no Redis e se é válido
 * - Atualiza a senha do usuário no banco (já criptografada)
 * - Remove o código do Redis para evitar reuso
 */
exports.changePassword = async (req, res) => {
    const { email, code, password } = req.body;

    try {
        if (!email || !code || !password) {
            return res.status(400).json({ error: 'Campos "email", "code" e "password" são obrigatórios.' });
        }

        // Recupera código salvo no Redis
        const storedCode = await redisClient.get(`resetCode:${email}`);

        if (!storedCode) {
            return res.status(400).json({ error: 'Código inválido ou expirado.' });
        }

        if (storedCode !== code) {
            return res.status(400).json({ error: 'Código inválido.' });
        }

        // Atualiza senha no banco
        const encryptedPassword = CryptoJS.AES.encrypt(password, process.env.CRYPTO_SECURITY_PASS).toString();
        await User.update({ password: encryptedPassword }, { where: { email } });

        // Apaga o código do Redis
        await redisClient.del(`resetCode:${email}`);

        res.status(200).json({ message: 'Senha alterada com sucesso.' });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao atualizar a senha.' });
    }
};

/**
 * Controller de Solicitação de Código para Reset de Senha
 * - Gera código de 6 dígitos aleatório
 * - Salva o código no Redis com expiração de 15 minutos
 * - Envia o código por e-mail usando Nodemailer
 */
exports.passwordCode = async (req, res) => {
    const email = req.body.email;

    if (!email) {
        return res.status(400).json({ error: 'email is required' });
    }

    // Código de 6 dígitos aleatório
    const code = Math.floor(100000 + Math.random() * 900000);

    try {
        // Salva o código no Redis com expiração (900s = 15min)
        await redisClient.setEx(`resetCode:${email}`, 900, code.toString());

        // Configuração do e-mail
        const mailOptions = {
            from: `${process.env.EMAIL_NAME}`,
            to: req.body.email,
            subject: "Redefinição de senha - AgroShare",
            html: `
            <body style="margin: 0; padding: 0;">
            <table class="outer table" style="border-spacing: 15px;" align="center" border="0" cellpadding="0" cellspacing="0" width="600" >
                <tr class="content">
                <td style="padding: 0px 15px; border: 0.5px solid #CECECE; border-radius: 5px;" bgcolor="#ffffff">
                    <table border="0" width="100%">
                    <tr>
                        <td>
                        <p align="center" style="color: #000000; font-size: 20px; font-weight: bold;">Use o código abaixo para resetar a sua senha:</p>
                    
                        <div style="width: 300px; border: none; border-radius: 5px; background-color: #00C74D; color: white; font-size: 30px; font-weight: bold; text-align: center; margin: 0 auto;">
                            <div align="center" style="padding: 10px 0px 10px 0px;">${code}</div>
                        </div>

                        <br>

                        </td>
                    </tr>
                    </table>
                </td>
                </tr>
                <tr class="footer">
                <td align="center" bgcolor="#000000" style="padding: 1px 0px; font-size: 1em; border-radius: 5px;">
                    <p style="color: #ffffff;">&reg; Anotações PDS 2025</p>
                </td>
                </tr>
            </table>
            </body>`,
        };

        // Envia o e-mail com o código
        await transporter.sendMail(mailOptions);

        res.status(200).json({ message: 'Email enviado com sucesso.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Ocorreu um erro ao enviar o e-mail. Tente novamente mais tarde!' });
    }
}
