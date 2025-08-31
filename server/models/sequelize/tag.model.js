const { DataTypes } = require('sequelize');
const sequelize = require('../../../config/sequelize');

const Tag = sequelize.define('Tag', {
    id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
}, {
    tableName: 'tags',
    timestamps: false,
});

module.exports = Tag;
