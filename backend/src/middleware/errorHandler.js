const { ValidationError, UniqueConstraintError, ForeignKeyConstraintError } = require('sequelize');

/**
 * errorHandler
 * Centraliza el manejo de errores: Sequelize, errores de negocio y errores genéricos.
 */
function errorHandler(err, req, res, next) {
  if (err instanceof UniqueConstraintError) {
    return res.status(409).json({
      status:  'error',
      message: 'Ya existe un registro con ese valor.',
      errors:  err.errors.map(e => ({ field: e.path, message: e.message })),
    });
  }

  if (err instanceof ValidationError) {
    return res.status(400).json({
      status:  'error',
      message: 'Error de validación.',
      errors:  err.errors.map(e => ({ field: e.path, message: e.message })),
    });
  }

  if (err instanceof ForeignKeyConstraintError) {
    return res.status(400).json({
      status:  'error',
      message: 'Referencia a un registro que no existe.',
    });
  }

  const statusCode = err.statusCode ?? 500;
  const message    = err.message   ?? 'Error interno del servidor.';

  if (statusCode === 500) console.error(err);

  res.status(statusCode).json({ status: 'error', message });
}

module.exports = errorHandler;
