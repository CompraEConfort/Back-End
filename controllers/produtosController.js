const mysql = require('../mysql').pool;

exports.getProdutos = (req, res, next) => {    
    mysql.getConnection((error, conn) => {
        if (error) { return res.status(500).send({ error: error }) }
        conn.query(
          'SELECT * FROM products;',
          (error, result, fields) => {
            if (error) { return res.status(500).send({ error: error }) }
            const response = {
                quantidade: result.length,
                produtos: result.map(prod => {
                    return {
                        id_produto: prod.id,
                        nome: prod.name,
                        preco: prod.value,
                        imagem_produto: prod.imagem_produto
                    }
                })
            }
            return res.status(200).send(response);
          }  
        )
    });
};

exports.postProdutos = (req, res, next) => {
    console.log(req.usuario);
    mysql.getConnection((error, conn) => {
        if (error) { return res.status(500).send({ error: error }) }
        conn.query(
            'INSERT INTO products (name, value, weight, expiration_date, manufacturing_date) VALUES (?, ?, ?, ?, ?);',
            [
                req.body.name,
                req.body.value,
                req.body.weight,
                new Date(req.body.expiration_date).toISOString().slice(0, 19).replace('T', ' '),
                new Date(req.body.manufacturing_date).toISOString().slice(0, 19).replace('T', ' ')
            ],
            (error, result, field) => {
                conn.release();
                if (error) { return res.status(500).send({ error: error }) }
                const response = {
                    mensagem: 'Produto inserido com sucesso',
                    produtoCriado: {
                        id_produto: result.id_produto,
                        nome: req.body.nome,
                        preco: req.body.preco,
                        request: {
                            tipo: 'GET',
                            descricao: 'Retorna todos os produtos',
                            url: 'http://localhost:3000/produtos'
                        }
                    }
                }
                return res.status(201).send(response);
            }
        )      
    });   
};

exports.getProdutoId = (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if (error) { return res.status(500).send({ error: error }) }
        conn.query(
            'SELECT * FROM products WHERE id = ?',
            [req.params.id_produto],
            (error, result, fields) => {
                if (error) { return res.status(500).send({ error: error }) }
                if (result.length == 0) {
                    return res.status(404).send({
                        mensagem: 'Não foi encontrado um produto com o ID ' + req.params.id_produto
                    });
                }
                const response = {
                    produto: {
                        id_produto: result[0].id,
                        nome: result[0].name,
                        preco: result[0].value
                    }
                }
                return res.status(200).send(response);
            }  
        )
    });  
};

exports.getProdutoByCategory = (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if (error) { return res.status(500).send({ error: error }) }
        var query = ''
        query += ' SELECT * '
        query += ' FROM products ' 
        query += ' WHERE products.category = ?'
    
        conn.query(
            query,
            [req.params.nome_corredor],
            (error, result, fields) => {
                if (error) { return res.status(500).send({ error: error }) }
                if (result.length == 0) {
                    return res.status(404).send({
                        
                        mensagem: 'Não foi encontrado produtos para a categoria ' + req.body.nomeCorredor
                    });
                }
                const response = {
                    quantidade: result.length,
                    produtos: result.map(prod => {
                        return {
                            idProduto: prod.id_product,
                            name: prod.name,
                            value: prod.value,
                            imageLink: prod.image_link
                        }
                    })
                }
                return res.status(200).send(response);
            }  
        )
    });  
};

exports.getProductsByCategoryAndSupermarketId = (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if (error) { return res.status(500).send({ error: error }) }
        var query = ''
        query += 'SELECT products.*'
        query += 'FROM products' 
        query += 'INNER JOIN products_supermarkets ON products.id_product = products_supermarkets.id_product' 
        query += 'INNER JOIN supermarkets ON supermarkets.id_supermarket = products_supermarkets.id_supermarket'  
        query += 'WHERE supermarkets.id_supermarket = ?'
        query += 'AND products.category = ?'
    
        conn.query(
            query,
            [req.body.codigoSupermercado, req.body.nomeCorredor],
            (error, result, fields) => {
                if (error) { return res.status(500).send({ error: error }) }
                if (result.length == 0) {
                    return res.status(404).send({
                        mensagem: 'Não foi encontrado produtos para a categoria ' + req.body.nomeCorredor
                    });
                }
                const response = {
                    quantidade: result.length,
                    produtos: result.map(prod => {
                        return {
                            id_produto: prod.id,
                            name: prod.name,
                            value: prod.value,
                            imageLink: prod.image_link
                        }
                    })
                }
                return res.status(200).send(response);
            }  
        )
    });  
};

exports.patchProduto = (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if (error) { return res.status(500).send({ error: error }) }
        conn.query(
            `UPDATE products
                SET name       = ?
              WHERE id         = ?`,
            [
                req.body.name, 
                req.body.id
            ],
            (error, result, field) => {
                conn.release();
                if (error) { return res.status(500).send({ error: error }) }
                const response = {
                    mensagem: 'Produto atualizado com sucesso',
                    produtoAtualizado: {
                        id_produto: req.body.id,
                        nome: req.body.name,
                        preco: req.body.value
                    }
                }
                return res.status(202).send(response);
            }
        )      
    });  
};

exports.deleteProduto = (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if (error) { return res.status(500).send({ error: error }) }
        conn.query(
            `DELETE FROM products WHERE id = ?`, [req.body.id],
            (error, result, field) => {
                conn.release();
                if (error) { return res.status(500).send({ error: error }) }
                const response = {
                    mensagem: 'Produto removido com sucesso'
                }
                return res.status(202).send(response);
            }
        )      
    }); 
};