const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class Project extends Model {}

Project.init(
  {
    id: {
      type:         DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey:   true,
    },
    name: {
      type:      DataTypes.STRING(100),
      allowNull: false,
      unique: { msg: 'Ya existe un proyecto con ese nombre.' },
      validate: {
        notEmpty: { msg: 'El nombre del proyecto no puede estar vacío.' },
        len: {
          args: [1, 100],
          msg:  'El nombre debe tener entre 1 y 100 caracteres.',
        },
      },
    },
    description: {
      type:      DataTypes.TEXT,
      allowNull: true,
      validate: {
        len: {
          args: [0, 500],
          msg:  'La descripción no puede superar los 500 caracteres.',
        },
      },
    },
    image_url: {
      type:      DataTypes.TEXT,
      allowNull: true,
    },
    user_id: {
      type:      DataTypes.UUID,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName:     'Project',
    tableName:     'projects',
    underscored:   true,
    timestamps:    true,
  }
);

module.exports = Project;
