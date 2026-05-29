const taskRepository    = require('../repositories/TaskRepository');
const projectRepository = require('../repositories/ProjectRepository');

class TaskService {
  async getByProject(projectId, userId, filters) {
    await this.#assertProjectOwnership(projectId, userId);
    return taskRepository.findByProject(projectId, filters);
  }

  async create(projectId, userId, data) {
    await this.#assertProjectOwnership(projectId, userId);
    return taskRepository.createWithLabels({ ...data, project_id: projectId });
  }

  async update(id, data) {
    const updated = await taskRepository.updateWithLabels(id, data);
    if (!updated) this.#notFound('Tarea no encontrada.');
    return updated;
  }

  async updateStatus(id, status) {
    const updated = await taskRepository.updateWithLabels(id, { status });
    if (!updated) this.#notFound('Tarea no encontrada.');
    return updated;
  }

  async delete(id) {
    const task = await taskRepository.findById(id);
    if (!task) this.#notFound('Tarea no encontrada.');
    await taskRepository.destroy(id);
  }

  getByDateRange(from, to, userId) {
    return taskRepository.findByDateRange(from, to, userId);
  }

  getInbox(userId) {
    return taskRepository.findInbox(userId);
  }

  getToday(userId) {
    return taskRepository.findToday(userId);
  }

  getByLabel(labelId, userId) {
    return taskRepository.findByLabel(labelId, userId);
  }

  async #assertProjectOwnership(projectId, userId) {
    const project = await projectRepository.findByIdForUser(projectId, userId);
    if (!project) this.#notFound('Proyecto no encontrado.');
  }

  #notFound(message) {
    const err = new Error(message);
    err.statusCode = 404;
    throw err;
  }
}

module.exports = new TaskService();
