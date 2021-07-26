const mysql = require('../mysql').pool;

exports.getPedidos = (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if (error) { return res.status(500).send({ error: error }) }
        conn.query(
            `SELECT orders.id_order, 
                    orders.quantity, 
                    products.id_product, 
                    products.value,
                    products.name 
               FROM orders 
         INNER JOIN products 
                 ON products.id_product = orders.id_product`,
            (error, result, fields) => {
                if (error) { return res.status(500).send({ error: error }) }
                const response = {
                    pedidos: result.map(ped => {
                        return {
                            id_pedido: ped.id_order,
                            quantidade: ped.quantity,
                            produto: {
                                id_produto: ped.id_product,
                                name: ped.name,
                                preco: ped.value
                            }
                        }
                    })
                }
                return res.status(200).send(response);
            }  
        )
    });
};

exports.postPedidos = (req, res, next) => {

    mysql.getConnection((error, conn) => {
        if (error) { return res.status(500).send({ error: error }) }
        conn.query('SELECT name FROM products WHERE id_product = ?', [req.body.id_produto], (error, result, field) => {
            const nomeProduto = result.name;
            if (result.length == 0) {
                return res.status(404).send({
                    mensagem: 'Não foi encontrado um produto com o ID ' + req.body.id_produto
                });
            }
            if (error) { return res.status(500).send({ error: error }) }            
            conn.query(
                'INSERT INTO orders (id_product, quantity) VALUES (?, ?)',
                [req.body.id_produto, req.body.quantidade],
                (error, result, field) => {
                    conn.release();
                    if (error) { return res.status(500).send({ error: error }) }
                    const response = {
                        mensagem: 'Pedido inserido com sucesso',
                        pedidoCriado: {
                            id_pedido: result.id_order,
                            nome_produto: nomeProduto, //Todo: investigar o result
                            id_produto: req.body.id_produto,
                            quantidade: req.body.quantidade,
                        }
                    }
                    return res.status(201).send(response);
                }
            )  

        });
    });  
};

exports.getPedidoId = (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if (error) { return res.status(500).send({ error: error }) }
        conn.query(
            'SELECT * FROM orders WHERE id_order = ?',
            [req.params.id_pedido],
            (error, result, fields) => {
                if (error) { return res.status(500).send({ error: error }) }
                if (result.length == 0) {
                    return res.status(404).send({
                        mensagem: 'Não foi encontrado um pedido com o ID ' + req.params.id_pedido
                    });
                }
                const response = {
                    pedido: {
                        id_pedido: result[0].id_order,
                        id_produto: result[0].id_product,
                        quantidade: result[0].quantity
                    }
                }
                return res.status(200).send(response);
            }  
        )
    }); 
};

exports.deletePedido = (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if (error) { return res.status(500).send({ error: error }) }
        conn.query(
            `DELETE FROM orders WHERE id_order = ?`, [req.body.id_pedido],
            (error, result, field) => {
                conn.release();
                if (error) { return res.status(500).send({ error: error }) }
                const response = {
                    mensagem: 'Pedido removido com sucesso', 
                }
                return res.status(202).send(response);
            }
        )      
    }); 
};