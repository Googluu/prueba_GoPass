const labelRepository = require('../repositories/LabelRepository');

/**
 * LabelService — principio S (Single Responsibility).
 * Única responsabilidad: lógica de negocio de etiquetas.
 */
class LabelService {
  getAll() {
    return labelRepository.findAll();
  }

  create(data) {
    return labelRepository.create(data);
  }

  async delete(id) {
    const deleted = await labelRepository.destroy(id);
    if (!deleted) this.#notFound('Etiqueta no encontrada.');
  }

  #notFound(message) {
    const err  = new Error(message);
    err.statusCode = 404;
    throw err;
  }
}

module.exports = new LabelService();
