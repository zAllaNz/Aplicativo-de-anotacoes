// jest.config.js
module.exports = {
    testEnvironment: 'node',

    testMatch: [
        '**/__tests__/**/*.test.js'
    ],

    testPathIgnorePatterns: [
        '/node_modules/'
    ],

    collectCoverageFrom: [
        'server/**/*.js',
        '!server/models/sequelize/index.js',
        '!index.js',
        '!**/node_modules/**'
    ],

    clearMocks: true,
    testTimeout: 10000,
    verbose: true,

    // ⚠️ Eu recomendo remover isso depois:
    // forceExit: true,

    detectOpenHandles: false
};
