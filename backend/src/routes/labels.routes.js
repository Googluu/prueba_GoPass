const { Router } = require('express');
const ctrl      = require('../controllers/labels.controller');
const tasksCtrl = require('../controllers/tasks.controller');

const router = Router();

router.get('/',              ctrl.getAll);
router.post('/',             ctrl.create);
router.delete('/:id',        ctrl.remove);

// Tareas filtradas por etiqueta — para el sidebar
router.get('/:id/tasks',     tasksCtrl.getByLabel);

module.exports = router;
