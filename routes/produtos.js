const express = require('express');
const router = express.Router();
const login = require('../middleware/login');

const ProdutoController = require('../controllers/produtosController');

router.get('/', ProdutoController.getProdutos);
router.post('/', ProdutoController.postProdutos);
router.get('/:id_produto', ProdutoController.getProdutoId);
router.get('/corredores/:nome_corredor', ProdutoController.getProdutoByCategory);
router.patch('/', ProdutoController.patchProduto);
router.delete('/', login.obrigatorio, ProdutoController.deleteProduto);
module.exports = router;