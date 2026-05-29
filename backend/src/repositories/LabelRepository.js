const BaseRepository = require('./BaseRepository');
const { Label } = require('../models');

/**
 * LabelRepository.
 * Unica responsabilidad: acceso a datos de etiquetas.
 */
class LabelRepository extends BaseRepository {
  constructor() {
    super(Label);
  }

  findAll() {
    return Label.findAll({ order: [['name', 'ASC']] });
  }
}

module.exports = new LabelRepository();
