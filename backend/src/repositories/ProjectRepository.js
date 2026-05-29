const { fn, col, literal, Op } = require('sequelize');
const BaseRepository = require('./BaseRepository');
const { Project, Task } = require('../models');

const TASK_COUNT_ATTRIBUTES = [
  [fn('COUNT', col('tasks.id')),                                                    'total_tasks'],
  [fn('COUNT', literal("CASE WHEN tasks.status = 'todo' THEN 1 END")),             'todo_count'],
  [fn('COUNT', literal("CASE WHEN tasks.status = 'in_progress' THEN 1 END")),      'in_progress_count'],
  [fn('COUNT', literal("CASE WHEN tasks.status = 'done' THEN 1 END")),             'done_count'],
];

const TASK_INCLUDE = { model: Task, as: 'tasks', attributes: [] };

class ProjectRepository extends BaseRepository {
  constructor() {
    super(Project);
  }

  findAllWithStats(search, userId) {
    const where = { user_id: userId };
    if (search) where.name = { [Op.iLike]: `%${search}%` };
    return Project.findAll({
      where,
      attributes: { include: TASK_COUNT_ATTRIBUTES },
      include:    [TASK_INCLUDE],
      group:      ['Project.id'],
      order:      [['created_at', 'DESC']],
    });
  }

  findByIdWithStats(id, userId) {
    return Project.findOne({
      where:      { id, user_id: userId },
      attributes: { include: TASK_COUNT_ATTRIBUTES },
      include:    [TASK_INCLUDE],
      group:      ['Project.id'],
    });
  }

  // Verifica que el proyecto exista Y pertenezca al usuario
  findByIdForUser(id, userId) {
    return Project.findOne({ where: { id, user_id: userId } });
  }
}

module.exports = new ProjectRepository();
