const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Rota para Cadastro de novo usuário
router.post('/register', authController.register);

// Rota para Login
router.post('/login', authController.login);

module.exports = router;