const taskService = require('../services/TaskService');

async function getByProject(req, res) {
  const { status, priority } = req.query;
  const data = await taskService.getByProject(req.params.id, req.user.id, { status, priority });
  res.json({ status: 'success', data });
}

async function create(req, res) {
  const data = await taskService.create(req.params.id, req.user.id, req.body);
  res.status(201).json({ status: 'success', data });
}

async function update(req, res) {
  const data = await taskService.update(req.params.id, req.body);
  res.json({ status: 'success', data });
}

async function updateStatus(req, res) {
  const data = await taskService.updateStatus(req.params.id, req.body.status);
  res.json({ status: 'success', data });
}

async function remove(req, res) {
  await taskService.delete(req.params.id);
  res.status(204).send();
}

async function getByDateRange(req, res) {
  const { from, to } = req.query;
  if (!from || !to) {
    return res.status(400).json({ status: 'error', message: 'Los parámetros from y to son requeridos.' });
  }
  const data = await taskService.getByDateRange(from, to, req.user.id);
  res.json({ status: 'success', data });
}

async function getInbox(req, res) {
  const data = await taskService.getInbox(req.user.id);
  res.json({ status: 'success', data });
}

async function getToday(req, res) {
  const data = await taskService.getToday(req.user.id);
  res.json({ status: 'success', data });
}

async function getByLabel(req, res) {
  const data = await taskService.getByLabel(req.params.id, req.user.id);
  res.json({ status: 'success', data });
}

module.exports = { getByProject, create, update, updateStatus, remove, getInbox, getToday, getByLabel, getByDateRange };
