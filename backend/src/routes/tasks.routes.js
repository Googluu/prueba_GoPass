const { Router } = require('express');
const ctrl = require('../controllers/tasks.controller');

const router = Router();

// Rutas estáticas primero — evita que Express las resuelva como /:id
router.get('/inbox',        ctrl.getInbox);
router.get('/today',        ctrl.getToday);
router.get('/range',        ctrl.getByDateRange);

router.put('/:id',          ctrl.update);
router.patch('/:id/status', ctrl.updateStatus);
router.delete('/:id',       ctrl.remove);

module.exports = router;
