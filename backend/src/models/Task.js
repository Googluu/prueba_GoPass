const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

const STATUSES   = ['todo', 'in_progress', 'done'];
const PRIORITIES = ['low', 'medium', 'high'];

class Task extends Model {}

Task.init(
  {
    id: {
      type:         DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey:   true,
    },
    project_id: {
      type:      DataTypes.UUID,
      allowNull: false,
    },
    title: {
      type:      DataTypes.STRING(200),
      allowNull: false,
      validate: {
        notEmpty: { msg: 'El título de la tarea no puede estar vacío.' },
        len: {
          args: [1, 200],
          msg:  'El título debe tener entre 1 y 200 caracteres.',
        },
      },
    },
    description: {
      type:      DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type:         DataTypes.ENUM(...STATUSES),
      allowNull:    false,
      defaultValue: 'todo',
      validate: {
        isIn: {
          args: [STATUSES],
          msg:  `El estado debe ser uno de: ${STATUSES.join(', ')}.`,
        },
      },
    },
    priority: {
      type:         DataTypes.ENUM(...PRIORITIES),
      allowNull:    false,
      defaultValue: 'medium',
      validate: {
        isIn: {
          args: [PRIORITIES],
          msg:  `La prioridad debe ser una de: ${PRIORITIES.join(', ')}.`,
        },
      },
    },
    due_date: {
      type:      DataTypes.DATEONLY,
      allowNull: true,
      validate: {
        isDate: { msg: 'La fecha límite debe ser una fecha válida.' },
      },
    },
    hora_limite: {
      type:         DataTypes.TIME,
      allowNull:    true,
      defaultValue: '12:00:00',
    },
  },
  {
    sequelize,
    modelName:  'Task',
    tableName:  'tasks',
    underscored: true,
    timestamps:  true,
  }
);

module.exports = Task;
