// __tests__/setup/testSetup.js
require('dotenv').config({ path: '.env.test' });

// Mock do Redis Client
const mockRedisClient = {
    get: jest.fn(),
    set: jest.fn(),
    setEx: jest.fn(),
    del: jest.fn(),
    connect: jest.fn().mockResolvedValue(true),
    on: jest.fn()
};

jest.mock('../../config/redis', () => mockRedisClient);

// Mock do Nodemailer
const mockTransporter = {
    sendMail: jest.fn().mockResolvedValue({ messageId: 'test-id' })
};

jest.mock('nodemailer', () => ({
    createTransport: jest.fn(() => mockTransporter)
}));

// Mock do Sequelize para testes unitários
jest.mock('../../config/sequelize', () => {
    const SequelizeMock = require('sequelize-mock');
    return new SequelizeMock();
});

module.exports = {
    mockRedisClient,
    mockTransporter
};