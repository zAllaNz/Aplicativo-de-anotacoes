const { DataTypes } = require('sequelize');
const sequelize = require('../../../config/sequelize');

const NoteTag = sequelize.define('NoteTag', {
    note_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true,
    },
    tag_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true,
    },
}, {
    tableName: 'note_tags',
    timestamps: false,
});

module.exports = NoteTag;
