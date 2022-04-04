const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mysql = require('../mysql').pool;

exports.getSupermercado = (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if (error) { return res.status(500).send({ error: error }) }
        conn.query(
            'SELECT * FROM supermarkets;',
            (error, result) => {
                if (error) { return res.status(500).send({ error: error }) }
                const response = {
                    quantidade: result.length,
                    produtos: result.map(prod => {
                        return {
                            id_supermercado: prod.id_supermarket,
                            nome: prod.name,
                            email: prod.email,
                            cnpj: prod.cnpj,
                            endereco: prod.address,
                            Bairro: prod.neighborhood,
                            Cidade: prod.city,
                            Cep: prod.cep,
                            Telefone: prod.telefone,
                            imagem: prod.image_link
                        }
                    })
                }
                return res.status(200).send(response);
            }
        )
    });
};

exports.postSupermercado = (req, res) => {
    console.log(req.body.name);
    mysql.getConnection((error, conn) => {
        if (error) { return res.status(500).send({ error: error }) }
        conn.query('SELECT email FROM supermarkets WHERE email = ?', [req.body.email], (error, results) => {
            if (error) { return res.status(500).send({ error: error }) }
            if (results.length > 0) {
                res.status(409).send({ mensagem: 'Supermercado já cadastrado' })
            } else {
                bcrypt.hash(req.body.senha, 10, (errBcrypt, hash) => {
                    if (errBcrypt) { return res.status(500).send({ error: errBcrypt }) }
                    conn.query(
                        'INSERT INTO supermarkets (name, email, password, cnpj, address, neighborhood, city, cep, telefone, image_link) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);',
                        [

                            req.body.name,
                            req.body.email,
                            hash,
                            req.body.cnpj,
                            req.body.endereco,
                            req.body.bairro,
                            req.body.cidade.toLowerCase(),
                            req.body.cep,
                            req.body.telefone,
                            req.body.imagem
                        ],
                        (error, result) => {
                            conn.release();
                            if (error) { return res.status(500).send({ error: error }) }
                            const response = {
                                mensagem: 'Supermercado inserido com sucesso',
                                supermercadoCriado: {
                                    id_produto: result.id_supermarket,
                                    nome: req.body.name,
                                    email: req.body.email,
                                    senha: req.body.senha,
                                    cnpj: req.body.cnpj,
                                    endereco: req.body.endereco,
                                    Bairro: req.body.bairro,
                                    Cidade: req.body.cidade,
                                    Cep: req.body.cep,
                                    Telefone: req.body.telefone,
                                    imagem: req.body.imagem
                                }
                            }
                            return res.status(201).send(response);

                        }
                    )
                });
            }
        });
    });
};

exports.loginSupermercado = (req, res, next) => {
    // console.log(req.body);
    mysql.getConnection((error, conn) => {
        if (error) { return res.status(500).send({ error: error }) }
        const query = `SELECT * FROM supermarkets WHERE email = ?`
        conn.query(query, [req.body.email], (error, results, fields) => {
            console.log(results);
            if (error) { return res.status(500).send({ error: error }) }
            if (results.length < 1) {
                return res.status(401).send({ mensagem: 'Falha na autenticação' })
            }
            bcrypt.compare(req.body.senha, results[0].password, (err, result) => {
                if (err) {
                    return res.status(401).send({ mensagem: 'Falha na autenticação' })
                }
                if (result) {
                    const tokenMerc = jwt.sign({
                        id: results[0].id_supermarket,
                        email: results[0].email
                    }, 
                    process.env.JWT_KEY,
                    {
                        expiresIn: "1h"
                    });
                    return res.status(200).send({ 
                        mensagem: 'Autenticado com sucesso',
                        tokenMerc: tokenMerc,
                        userMercado: results[0]
                    });  
               
                }
                return res.status(401).send({ mensagem: 'Falha na autenticação' })
            });            
        });
    });
};

exports.getUserMercado = (req, res, next) => {
    // console.log(req.headers);
    const tokenMerc = req.headers.authorization
    const jwt_payload = jwt.verify(tokenMerc, process.env.JWT_KEY)
    const id_supermarket = jwt_payload.id_supermarket
    

    mysql.getConnection((error, conn) => {
        if (error) { return res.status(500).send({ error: error }) }
        conn.query(
            `SELECT * FROM supermarkets WHERE id_supermarket = ?`, [id_supermarket],
            (error, result, field) => {
                conn.release();
                if (error) { return res.status(500).send({ error: error }) }
                console.log(result[0]);
                result = result[0]
                const response = {
                    nome: result.name,
                    email: result.email,
                    cnpj: result.cnpj,
                    endereco: result.address,
                    complemento: result.complemento,
                    cidade: result.city,
                    bairro: result.neighborhood,
                    cep: result.cep,
                    telefone: result.telefone,
                    image: result.imagem_link
                }
                return res.status(202).send(response);
            }
        )
    });
}

exports.getSupermercadoId = (req, res, next) => {
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

exports.getSupermercadoNome = (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if (error) { return res.status(500).send({ error: error }) }
        conn.query(
            'SELECT * FROM supermarkets WHERE city = ?',
            [req.params.nome_supermercado.toLowerCase()],
            (error, result, fields) => {
                if (error) { return res.status(500).send({ error: error }) }
                if (result.length == 0) {
                    return res.status(404).send({
                        mensagem: 'Não foi encontrado um supermecado com o nome ' + req.params.nome_supermercado
                    });
                }
                const response = {
                    quantidade: result.length,
                    supermercados: result.map(prod => {
                        return {
                            idSupermercado: prod.id_supermarket,
                            nome: prod.name,
                            rua: prod.street,
                            numero: prod.number,
                            complemento: prod.complement,
                            bairro: prod.neighborhood,
                            cidade: prod.city,
                            cep: prod.cep,
                            imageLink: prod.image_link
                        }
                    })
                }
                return res.status(200).send(response);
            }
        )
    });
};

exports.getCorredoresSupermercado = (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if (error) { return res.status(500).send({ error: error }) }
        conn.query(
            'SELECT * FROM corredores WHERE id_supermercado = ?',
            [req.params.codigo_supermercado.toLowerCase()],
            (error, result, fields) => {
                if (error) { return res.status(500).send({ error: error }) }
                if (result.length == 0) {
                    return res.status(404).send({
                        mensagem: 'Não foi encontrado um supermecado com o nome ' + req.params.nome_supermercado
                    });
                }
                const response = {
                    quantidade: result.length,
                    corredores: result.map(prod => {
                        return {
                            idSupermercado: prod.id_supermercado,
                            imageLink: prod.image_link,
                            nome: prod.nome_corredor
                        }
                    })
                }
                return res.status(200).send(response);
            }
        )
    });
};

exports.patchSupermercado = (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if (error) { return res.status(500).send({ error: error }) }
        conn.query(
            `UPDATE supermarkets
                SET name = ?, address = ?, city = ?, neighborhood = ?, cep = ?, telefone = ?
              WHERE id_supermarket = ?`,
            [
                req.body.name, 
                req.body.endereco,
                req.body.cidade,
                req.body.bairro,
                req.body.cep,
                req.body.telefone,
                // req.body.image_link,
                req.body.id_supermarket
            ],
            (error, result, field) => {
                conn.release();
                if (error) { return res.status(500).send({ error: error }) }
                conn.query(`SELECT * FROM supermarkets WHERE id_supermarket = ?`, [req.body.id_supermarket], (error, result, field) => {
                    if (error) { return res.status(500).send({ error: error }) }
                    const response = {
                        mensagem: 'Suas mudanças foram salvas ! ',
                        mercadoAtualizado: result[0]
                    }
                    return res.status(202).send(response);
                })
            }
        )
    });
};

exports.deleteSupermercado = (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if (error) { return res.status(500).send({ error: error }) }
        conn.query(
            `DELETE FROM supermarkets WHERE id_supermarket = ?`, [req.body.id],
            (error, result, field) => {
                conn.release();
                if (error) { return res.status(500).send({ error: error }) }
                const response = {
                    mensagem: 'Supermercado removido com sucesso'
                }
                return res.status(202).send(response);
            }
        )
    });
};