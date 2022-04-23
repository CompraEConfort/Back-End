const express = require('express');
const router = express.Router();
const login = require('../middleware/login');

const ProdutoController = require('../controllers/produtosController');


router.get('/', ProdutoController.getProdutos);
router.post('/add', ProdutoController.postProdutos);
router.get('/addProdutos/:id_produto', ProdutoController.getProdutoId);
router.get('/corredores/:nome_corredor/:id_supermarket', ProdutoController.getProdutoByCategory);
// router.get('/getProdutos', ProdutoController.getProdutos);
router.patch('/', ProdutoController.patchProduto);
router.delete('/', login.opcional, ProdutoController.deleteProduto);
module.exports = router;