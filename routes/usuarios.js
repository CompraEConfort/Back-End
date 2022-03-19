const express = require('express');
const router = express.Router();

const UsuariosController = require('../controllers/usuariosController');

router.post('/cadastro', UsuariosController.cadastrarUsuario);
router.post('/login', UsuariosController.login);
router.get('/login', UsuariosController.login);
router.patch('/altPerfil', UsuariosController.patchUser);

module.exports = router;