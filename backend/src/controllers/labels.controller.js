const labelService = require('../services/LabelService');

async function getAll(req, res) {
  const data = await labelService.getAll();
  res.json({ status: 'success', data });
}

async function create(req, res) {
  const data = await labelService.create(req.body);
  res.status(201).json({ status: 'success', data });
}

async function remove(req, res) {
  await labelService.delete(req.params.id);
  res.status(204).send();
}

module.exports = { getAll, create, remove };
