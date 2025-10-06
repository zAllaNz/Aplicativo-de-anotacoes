require('dotenv').config({ path: '.env' });

const express = require('express');
const session = require('express-session');
const cors = require('cors');
const pg = require('./config/sequelize');
const { RedisStore } = require('connect-redis');
const redisClient = require('./config/redis.js');
const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");

pg.sync()
    .then(() => { console.log("Connected on PostgreSQL!") })
    .catch(err => console.log('An error ocurred on PostgreSQL connection attempt:', err));

const app = express();
app.disable("x-powered-by");
app.set("trust proxy", 1);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const redisStore = new RedisStore({
    client: redisClient,
    prefix: "sess:",
});

app.use(session({
    store: redisStore,
    secret: process.env.REDIS_SECRET_KEY || "supersecret",
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24, // 1 dia
    },
}));

const apiPrefix = '/anotacoes/api/v1'

const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "API de Anotações",
            version: "1.0.0",
        },
        servers: [{ url: `http://localhost:${process.env.PORT}${apiPrefix}` }],
    },
    apis: ["./server/routes/*.js"], // 👈 pega anotações dentro dos arquivos de rotas
};

const specs = swaggerJsdoc(options);
app.use(apiPrefix + "/docs", swaggerUi.serve, swaggerUi.setup(specs));

app.get('/ping', (req, res) => {
    res.send('Pong!');
});

app.use((req, res, next) => {
    if (req.headers.user) {
        req.user = JSON.parse(req.headers.user);
    }
    next();
});


app.use(apiPrefix + '/auth', require('./server/routes/auth.route.js'));
app.use(apiPrefix + '/notes', require('./server/routes/note.route.js'));

app.listen(process.env.PORT, () => {
    console.log(`🚀 Server running on PORT: ${process.env.PORT}`);
});