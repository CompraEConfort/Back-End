const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');
const cors = require('cors');

const rotaProdutos = require('./routes/produtos');
const rotaPedidos = require('./routes/pedidos');
const rotaUsuarios = require('./routes/usuarios');
const rotaSupermercado = require('./routes/supermercado');

app.use(morgan('dev'));
app.use('/uploads', express.static('uploads'));
app.use(bodyParser.urlencoded({ extended: false })); // apenas dados simples
app.use(bodyParser.json()); // JSON de entrada no body

app.use(cors());
app.use((res, req, next) => {
    // res.header('Acess-Control-Allow-Origin', '*');
    // res.header(
    //     'Acess-Control-Allow-Header',
    //     'Origin, X-Requested-With, Content-Type, Accept, Authorization',
    // );

    // if (req.method === 'OPTIONS') {
    //     res.header('Acess-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
    //     return res.status(200).send({});
    // }
    // next();
    //Qual site tem permissão de realizar a conexão, no exemplo abaixo está o "*" indicando que qualquer site pode fazer a conexão
    res.header("Access-Control-Allow-Origin", "*");
	//Quais são os métodos que a conexão pode realizar na API
    res.header("Access-Control-Allow-Methods", 'GET,PUT,POST,DELETE');
    next();
});

app.use('/produtos', rotaProdutos, cors());
app.use('/pedidos', rotaPedidos, cors());
app.use('/usuarios', rotaUsuarios, cors());
app.use('/supermercados', rotaSupermercado, cors());

app.use((req, res, next) => {
    const erro = new Error('Não encontrado!');
    erro.status =404;
    next(erro);
});

app.use((error, req, res, next) => {
    res.status(error.status || 500);
    return res.send({
        erro: {
            mensagem: error.message
        }
    });
});

module.exports = app;