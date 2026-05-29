const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class Label extends Model {}

Label.init(
  {
    id: {
      type:         DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey:   true,
    },
    name: {
      type:      DataTypes.STRING(50),
      allowNull: false,
      unique: { msg: 'Ya existe una etiqueta con ese nombre.' },
      validate: {
        notEmpty: { msg: 'El nombre de la etiqueta no puede estar vacío.' },
        len: { args: [1, 50], msg: 'El nombre debe tener entre 1 y 50 caracteres.' },
      },
    },
    color: {
      type:         DataTypes.STRING(7),
      allowNull:    false,
      defaultValue: '#6366f1',
      validate: {
        is: {
          args: /^#[0-9A-Fa-f]{6}$/i,
          msg:  'El color debe ser un código hexadecimal válido (ej: #6366f1).',
        },
      },
    },
  },
  {
    sequelize,
    modelName:  'Label',
    tableName:  'labels',
    underscored: true,
    timestamps:  true,
  }
);

module.exports = Label;
