const express = require('express');
const router = express.Router();
const login = require('../middleware/login');

const PedidosController = require('../controllers/pedidosController');

router.get('/', login.obrigatorio, PedidosController.getPedidos);
router.post('/', login.obrigatorio, PedidosController.postPedidos);
router.get('/:id_pedido', login.obrigatorio, PedidosController.getPedidoId);
router.delete('/', login.obrigatorio, PedidosController.deletePedido);

module.exports = router;