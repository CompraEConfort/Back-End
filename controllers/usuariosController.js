const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mysql = require('../mysql').pool;

exports.cadastrarUsuario = (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if (error) { return res.status(500).send({ error: error }) }
        conn.query('SELECT email FROM users WHERE email = ?', [req.body.email], (error, results) => {
            if (error) { return res.status(500).send({ error: error }) }
            if (results.length > 0) {
                res.status(409).send({ mensagem: 'Usuário já cadastrado'})
            } else {
                bcrypt.hash(req.body.senha, 10, (errBcrypt, hash) => {
                    if (errBcrypt) { return res.status(500).send({ error: errBcrypt }) }
                    conn.query(
                        `INSERT INTO users (name, email, password, endereco, complemento, cidade, bairro, cep, telefone) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                        [req.body.name, req.body.email, hash, req.body.endereco, req.body.complemento, req.body.cidade, req.body.bairro, req.body.cep, req.body.telefone],
                        (error, results) => {
                            conn.release();
                            
                            var userid = id_usuario + email;
                            localStorage.user = userid
                            if (error) { return res.status(500).send({ error: error }) }
                            response = {
                                mensagem: 'Usuario criado com sucesso',
                                usuarioCriado: {
                                    id_usuario: results.insertId,
                                    email: req.body.email,
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

exports.login = (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if (error) { return res.status(500).send({ error: error }) }
        const query = `SELECT * FROM users WHERE email = ?`
        conn.query(query, [req.body.email], (error, results, fields) => {
            conn.release();
            if (error) { return res.status(500).send({ error: error }) }
            if (results.length < 1) {
                return res.status(401).send({ mensagem: 'Falha na autenticação' })
            }
            bcrypt.compare(req.body.senha, results[0].password, (err, result) => {
                if (err) {
                    return res.status(401).send({ mensagem: 'Falha na autenticação' })
                }
                if (result) {
                    const token = jwt.sign({
                        id_usuario: results[0].id_usuario,
                        email: results[0].email
                    }, 
                    process.env.JWT_KEY,
                    {
                        expiresIn: "1h"
                    });
                    return res.status(200).send({ 
                        mensagem: 'Autenticado com sucesso',
                        token: token
                    });  
               
                }
                return res.status(401).send({ mensagem: 'Falha na autenticação' })
            });            
        });
    });
};

exports.patchUser = (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if (error) { return res.status(500).send({ error: error }) }
        conn.query(
            `UPDATE users
                SET name = ?, endereco = ?, complemento = ?, cidade = ?, bairro = ?, cep =  ?, telefone = ?
              WHERE id = 9`,
            [
                req.body.name, 
                req.body.endereco,
                req.body.complemento,
                req.body.cidade,
                req.body.bairro,
                req.body.cep,
                req.body.telefone
            ],
            (error, result, field) => {
                conn.release();
                if (error) { return res.status(500).send({ error: error }) }
                const response = {
                    mensagem: 'Suas mudanças foram salvas ! ',
                    usuarioAtualizado: {
                        id_usuario: req.body.id,
                        nome: req.body.name,
                        endereco: req.body.endereco,
                        complemento: req.body.complemento,
                        cidade: req.body.cidade,
                        bairro: req.body.bairro,
                        cep: req.body.cep,
                        telefone: req.body.telefone
                    }
                }
                return res.status(202).send(response);
            }
        )      
    });  
};