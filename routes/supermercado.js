const express = require('express');
const router = express.Router();
const login = require('../middleware/login');

const supermercadoController = require('../controllers/supermercadoController');


router.get('/', login.obrigatorio, supermercadoController.getSupermercado);
router.post('/cadastro', supermercadoController.postSupermercado);
router.post('/loginMercado', supermercadoController.loginSupermercado);
router.get('/loginMercado', supermercadoController.loginSupermercado);
router.get('/perfilMercado',supermercadoController.getUserMercado);
router.get('/:id_supermarket', supermercadoController.getSupermercadoId);
router.get('/city/:nome_supermercado', supermercadoController.getSupermercadoNome);
router.get('/corredores/:codigo_supermercado', supermercadoController.getCorredoresSupermercado);
router.post('/uploadMercadoImage', supermercadoController.uploadMercadoImage);
router.patch('/', login.opcional, supermercadoController.patchSupermercado);
router.delete('/', login.opcional, supermercadoController.deleteSupermercado);

module.exports = router;