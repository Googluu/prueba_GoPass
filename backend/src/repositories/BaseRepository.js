/**
 * BaseRepository — principio O (Open/Closed) y D (Dependency Inversion).
 * Define el contrato genérico de acceso a datos.
 * Los repositorios concretos extienden sin modificar esta clase.
 */
class BaseRepository {
  constructor(model) {
    this.model = model;
  }

  findAll(options = {}) {
    return this.model.findAll(options);
  }

  findById(id, options = {}) {
    return this.model.findByPk(id, options);
  }

  create(data) {
    return this.model.create(data);
  }

  async update(id, data) {
    const [, [record]] = await this.model.update(data, {
      where:     { id },
      returning: true,
    });
    return record ?? null;
  }

  destroy(id) {
    return this.model.destroy({ where: { id } });
  }
}

module.exports = BaseRepository;
