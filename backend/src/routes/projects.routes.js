const { Router } = require('express');
const ctrl      = require('../controllers/projects.controller');
const tasksCtrl = require('../controllers/tasks.controller');
const upload    = require('../middleware/upload');

const router = Router();

router.get('/',        ctrl.getAll);
router.post('/',       ctrl.create);
router.get('/:id',     ctrl.getById);
router.put('/:id',     ctrl.update);
router.delete('/:id',  ctrl.remove);

// Image upload
router.post('/:id/image', upload.single('image'), ctrl.uploadImage);

// Tareas anidadas bajo proyecto
router.get('/:id/tasks',  tasksCtrl.getByProject);
router.post('/:id/tasks', tasksCtrl.create);

module.exports = router;
