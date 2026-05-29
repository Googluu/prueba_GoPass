const { literal, Op } = require('sequelize');
const BaseRepository = require('./BaseRepository');
const { Task, Project, Label } = require('../models');

const PRIORITY_ORDER = literal("CASE priority WHEN 'high' THEN 0 WHEN 'medium' THEN 1 ELSE 2 END");

const PROJECT_INCLUDE = {
  model:      Project,
  as:         'project',
  attributes: ['id', 'name'],
};

const LABEL_INCLUDE = {
  model:      Label,
  as:         'labels',
  attributes: ['id', 'name', 'color'],
  through:    { attributes: [] },
};

// Include de proyecto con filtro de usuario — garantiza aislamiento
function projectIncludeForUser(userId) {
  return {
    model:      Project,
    as:         'project',
    attributes: ['id', 'name'],
    where:      { user_id: userId },
    required:   true,
  };
}

class TaskRepository extends BaseRepository {
  constructor() {
    super(Task);
  }

  findByProject(projectId, filters = {}) {
    const where = { project_id: projectId };
    if (filters.status)   where.status   = filters.status;
    if (filters.priority) where.priority = filters.priority;
    return Task.findAll({
      where,
      include: [LABEL_INCLUDE],
      order:   [['created_at', 'DESC']],
    });
  }

  // Bandeja: todo + in_progress del usuario, mas recientes primero
  findInbox(userId) {
    return Task.findAll({
      where:   { status: ['todo', 'in_progress'] },
      include: [projectIncludeForUser(userId), LABEL_INCLUDE],
      order:   [['created_at', 'DESC']],
    });
  }

  // Hoy: tareas con due_date=hoy del usuario
  findToday(userId) {
    const today = new Date().toISOString().slice(0, 10);
    return Task.findAll({
      where:   { due_date: today },
      include: [projectIncludeForUser(userId), LABEL_INCLUDE],
      order:   [[PRIORITY_ORDER, 'ASC'], ['status', 'ASC']],
    });
  }

  // Rango de fechas para el calendario del usuario
  findByDateRange(from, to, userId) {
    return Task.findAll({
      where:   { due_date: { [Op.between]: [from, to] } },
      include: [projectIncludeForUser(userId), LABEL_INCLUDE],
      order:   [['due_date', 'ASC'], [PRIORITY_ORDER, 'ASC']],
    });
  }

  // Tareas de una etiqueta que pertenecen a proyectos del usuario
  findByLabel(labelId, userId) {
    return Task.findAll({
      include: [
        projectIncludeForUser(userId),
        { ...LABEL_INCLUDE, where: { id: labelId }, required: true },
      ],
      order: [[PRIORITY_ORDER, 'ASC'], ['created_at', 'DESC']],
    });
  }

  async createWithLabels({ labelIds = [], ...data }) {
    const task = await Task.create(data);
    if (labelIds.length) await task.setLabels(labelIds);
    return task.reload({ include: [LABEL_INCLUDE] });
  }

  async updateWithLabels(id, { labelIds, ...data }) {
    await Task.update(data, { where: { id } });
    const task = await Task.findByPk(id, { include: [LABEL_INCLUDE] });
    if (!task) return null;
    if (labelIds !== undefined) await task.setLabels(labelIds);
    return task.reload({ include: [LABEL_INCLUDE] });
  }
}

module.exports = new TaskRepository();
