const router = require('express').Router();
const controller = require('../controllers/taskController');
const validation = require('../middlewares/validation');
router.use(require('../middlewares/authMiddleware'));
router.get('/', controller.getTasks);
router.post('/', validation.task(), controller.createTask);
router.put('/:id', validation.id, validation.task(true), controller.updateTask);
router.delete('/:id', validation.id, controller.deleteTask);
module.exports = router;
