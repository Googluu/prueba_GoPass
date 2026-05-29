const path          = require('path');
const projectService = require('../services/ProjectService');
const supabase       = require('../config/supabase');

const BUCKET = 'project-images';

async function getAll(req, res) {
  const data = await projectService.getAll(req.query.search, req.user.id);
  res.json({ status: 'success', data });
}

async function getById(req, res) {
  const data = await projectService.getById(req.params.id, req.user.id);
  res.json({ status: 'success', data });
}

async function create(req, res) {
  const data = await projectService.create(req.body, req.user.id);
  res.status(201).json({ status: 'success', data });
}

async function update(req, res) {
  const data = await projectService.update(req.params.id, req.body, req.user.id);
  res.json({ status: 'success', data });
}

async function remove(req, res) {
  await projectService.delete(req.params.id, req.user.id);
  res.status(204).send();
}

async function uploadImage(req, res) {
  if (!req.file) {
    return res.status(400).json({ status: 'error', message: 'No se recibió ningún archivo.' });
  }

  // Verifica que el proyecto pertenezca al usuario antes de subir imagen
  await projectService.getById(req.params.id, req.user.id);

  const ext      = path.extname(req.file.originalname) || '.jpg';
  const filename = `${req.params.id}-${Date.now()}${ext}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(filename, req.file.buffer, {
      contentType: req.file.mimetype,
      upsert:      true,
    });

  if (error) {
    return res.status(500).json({ status: 'error', message: error.message });
  }

  const { data: { publicUrl } } = supabase.storage.from(BUCKET).getPublicUrl(filename);

  const data = await projectService.update(req.params.id, { image_url: publicUrl }, req.user.id);
  res.json({ status: 'success', data });
}

module.exports = { getAll, getById, create, update, remove, uploadImage };
