const projectRepository = require('../repositories/ProjectRepository');

class ProjectService {
  getAll(search, userId) {
    return projectRepository.findAllWithStats(search, userId);
  }

  async getById(id, userId) {
    const project = await projectRepository.findByIdWithStats(id, userId);
    if (!project) this.#notFound('Proyecto no encontrado.');
    return project;
  }

  create(data, userId) {
    return projectRepository.create({ ...data, user_id: userId });
  }

  async update(id, data, userId) {
    const project = await projectRepository.findByIdForUser(id, userId);
    if (!project) this.#notFound('Proyecto no encontrado.');
    return projectRepository.update(id, data);
  }

  async delete(id, userId) {
    const project = await projectRepository.findByIdForUser(id, userId);
    if (!project) this.#notFound('Proyecto no encontrado.');
    await projectRepository.destroy(id);
  }

  #notFound(message) {
    const err = new Error(message);
    err.statusCode = 404;
    throw err;
  }
}

module.exports = new ProjectService();
