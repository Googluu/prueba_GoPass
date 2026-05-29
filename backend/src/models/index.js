const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Project   = require('./Project');
const Task      = require('./Task');
const Label     = require('./Label');

// Modelo explicito para la tabla pivote — evita que Sequelize auto-genere
// timestamps ambiguos (created_at) que colisionan con los de Task en JOINs
const TaskLabel = sequelize.define('task_label', {
  task_id:  { type: DataTypes.UUID, primaryKey: true },
  label_id: { type: DataTypes.UUID, primaryKey: true },
}, {
  tableName:  'task_labels',
  timestamps: false,
  underscored: true,
});

// 1:N — Proyecto - Tareas
Project.hasMany(Task, {
  foreignKey: { name: 'project_id', allowNull: false },
  as:         'tasks',
  onDelete:   'CASCADE',
});
Task.belongsTo(Project, { foreignKey: 'project_id', as: 'project' });

// M:N — Task - Label a traves de task_labels
Task.belongsToMany(Label, {
  through:    TaskLabel,
  as:         'labels',
  foreignKey: 'task_id',
  otherKey:   'label_id',
});
Label.belongsToMany(Task, {
  through:    TaskLabel,
  as:         'tasks',
  foreignKey: 'label_id',
  otherKey:   'task_id',
});

module.exports = { sequelize, Project, Task, Label, TaskLabel };
