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
    content: {
        type: DataTypes.TEXT,
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
}, {
    tableName: 'notes',
    timestamps: false,
});

Note.belongsToMany(Tag, { through: NoteTag, foreignKey: 'note_id' });
Tag.belongsToMany(Note, { through: NoteTag, foreignKey: 'tag_id' });

module.exports = Note;
