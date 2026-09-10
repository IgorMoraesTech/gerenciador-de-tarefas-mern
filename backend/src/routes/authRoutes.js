const router = require('express').Router();
const controller = require('../controllers/authController');
const validation = require('../middlewares/validation');
router.post('/register', validation.auth(true), controller.register);
router.post('/login', validation.auth(false), controller.login);
module.exports = router;
