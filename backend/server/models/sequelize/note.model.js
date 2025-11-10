const { DataTypes } = require('sequelize');
const sequelize = require('../../../config/sequelize');
const Tag = require('./tag.model');
const NoteTag = require('./noteTag.model');

const Note = sequelize.define('Note', {
    id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true,
    },
    title: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    type: {
        type: DataTypes.STRING(20),
        defaultValue: 'text', // 'text' | 'list'
    },
    content: {
        type: DataTypes.JSONB,
        allowNull: true,
    },
    user_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    updated_at: {
        type: DataTypes.DATE,
    },
    deleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    deleted_at: {
        type: DataTypes.DATE,
    },
    order_index: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
    color: {
        type: DataTypes.STRING(10),
        defaultValue: '#FFE066',
    },
}, {
    tableName: 'notes',
    timestamps: false,
});

Note.belongsToMany(Tag, { through: NoteTag, foreignKey: 'note_id' });
Tag.belongsToMany(Note, { through: NoteTag, foreignKey: 'tag_id' });

module.exports = Note;
