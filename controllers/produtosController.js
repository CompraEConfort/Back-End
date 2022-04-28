const mysql = require('../mysql').pool;
const formidable = require('formidable');
const fs = require('fs');
const path = require('path');

exports.getProdutos = (req, res, next) => {    
    mysql.getConnection((error, conn) => {
        if (error) { return res.status(500).send({ error: error }) }
        // console.log("request body",req.body);
        conn.query(
            `SELECT * FROM products, products_supermarkets WHERE products.id_product = products_supermarkets.id_product AND products_supermarkets.id_supermarket = ?`, [req.query['id_supermarket']],
          (error, result, fields) => {
            if (error) { return res.status(500).send({ error: error }) }
            // console.log(result);
            const response = {
                quantidade: result.length,
                produtos: result.map(prod => {
                    return {
                        id_produto: prod.id_product,
                        nome: prod.name,
                        preco: prod.value,
                        categoria: prod.category,
                        imagem_produto: prod.image_link
                    }
                })
            }
            return res.status(200).send(response);
          }  
        )
    });
};

exports.postProdutos = (req, res, next) => {
    console.log(req.body);
    mysql.getConnection((error, conn) => {
        if (error) { return res.status(500).send({ error: error }) }
        conn.query(
            `INSERT INTO products (name, value, category, image_link) VALUES (?, ?, ?, ?)`,
            [
    
                req.body.name,
                req.body.value,
                req.body.category,
                req.body.image_link,
            ],
            (error, result, field) => {
                if (error) { return res.status(500).send({ error: error }) }

                console.log(result);

                let idProduto = result.insertId

                conn.query(
                    'INSERT INTO products_supermarkets (id_supermarket, id_product) VALUES (?,?)',
                    [req.body.id_supermarket, idProduto],
                    (error, result, field) => {
                        conn.release();
                        if (error) { return res.status(500).send({ error: error }) }

                        const response = {
                            mensagem: 'Produto inserido com sucesso',
                            id_product: idProduto
                        }
                        return res.status(201).send(response);
                    }
                )
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
    console.log(req.params);
    mysql.getConnection((error, conn) => {
        if (error) { return res.status(500).send({ error: error }) }
        var query = ''
        query += ' SELECT * '
        query += ' FROM products p, products_supermarkets ps' 
        query += ' WHERE p.category = ? && ps.id_supermarket = ? && p.id_product = ps.id_product'
    
        conn.query(
            query,
            [req.params.nome_corredor, req.params.id_supermarket],
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

// exports.getaddProduto = (req, res, next) => {
//     mysql.getConnection((error, conn) => {
//         if (error) { return res.status(500).send({ error: error }) }
//         var query = ''
//         query += ' SELECT * '
//         query += ' FROM products ' 
//         query += ' WHERE products.category = ?'
    
//         conn.query(
//             query,
//             [req.params.nome_corredor],
//             (error, result, fields) => {
//                 if (error) { return res.status(500).send({ error: error }) }
//                 if (result.length == 0) {
//                     return res.status(404).send({
                        
//                         mensagem: 'Não foi encontrado produtos para a categoria ' + req.body.nomeCorredor
//                     });
//                 }
//                 const response = {
//                     quantidade: result.length,
//                     produtos: result.map(prod => {
//                         return {
//                             idProduto: prod.id_product,
//                             name: prod.name,
//                             value: prod.value,
//                             imageLink: prod.image_link
//                         }
//                     })
//                 }
//                 return res.status(200).send(response);
//             }  
//         )
//     });  
// };

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
           `UPDATE products SET name = ?, value = ?, image_link = ?, category = ? WHERE id_product = ?`,
            [
                req.body.name, 
                req.body.value,
                req.body.image_link,
                req.body.category,
                req.body.id_product
            ],
            (error, result, field) => {
                conn.release();
                if (error) { return res.status(500).send({ error: error }) }
                conn.query(`SELECT * FROM products WHERE id_product = ?`, [req.body.id_product], (error, result, field) => {
                    if (error) { return res.status(500).send({ error: error }) }
                const response = {
                    mensagem: 'Produto atualizado com sucesso',
                    produtoAtualizado: result[0]
                }                
                return res.status(202).send(response);
            })
            }
        )      
    });  
};

exports.deleteProduto = (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if (error) { return res.status(500).send({ error: error }) }
        console.log(req.query.ids);
        conn.query(
            `DELETE FROM products WHERE id_product IN (${req.query.ids.join(',')})`, [],
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

exports.uploadProdutoImage = (req, res, next) => {
    const form = new formidable.IncomingForm();

    form.parse(req, (err, fields, files) => {
        console.log(fields);
        if (err) res.send('Erro');

        const oldpath = files.filetoupload.filepath;
        const imageType = files.filetoupload.originalFilename.split('.')[1];
        const idProduto = fields.idProduto;
        if (!idProduto) return res.status(401).send('Usuario não especificado')

        let imageName = `product_${idProduto}.${imageType}`;
        const newpath = path.join(__dirname, '../images/products/', imageName);
        
        try {
            fs.renameSync(oldpath, newpath);

            const dirPath = `http://localhost:3000/images/products/`
            const imagePath = dirPath + imageName
            mysql.getConnection((error, conn) => {
                console.log(error);
                if (error) { return res.status(500).send({ error: error }) }
                conn.query(
                    `UPDATE products SET image_link = ? WHERE id_product = ?`, [imagePath, idProduto],
                    (error, result, field) => {
                        conn.release();
                        if (error) {
                            console.log(error);
                            return res.status(500).send({ error: error }) }
                        console.log(result);
                        const response = {
                            message: 'Imagem atualizada com sucesso',
                            imagemAtualizada: imagePath
                        }
                        return res.status(202).send(response);
                    }
                )
                
            })         
        } catch (error) {
            res.status(401).send('Erro ao carregar imagem')
        }
    })
}