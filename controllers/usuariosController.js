const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mysql = require('../mysql').pool;
const formidable = require('formidable');
const fs = require('fs');
const path = require('path');

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
                        `INSERT INTO users (name, email, password, endereco, complemento, cidade, bairro, cep, telefone, imagem ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                        [req.body.name, req.body.email, hash, req.body.endereco, req.body.complemento, req.body.cidade, req.body.bairro, req.body.cep, req.body.telefone, req.body.imagem],
                        (error, results) => {
                            conn.release();
                            
                            if (error) { return res.status(500).send({ error: error }) }
                            response = {
                                mensagem: 'Usuario criado com sucesso',
                                usuarioCriado: {
                                    id_usuario: results.insertId,
                                    email: req.body.email
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
    console.log(req.body);
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
                        id: results[0].id,
                        email: results[0].email
                    }, 
                    process.env.JWT_KEY,
                    {
                        expiresIn: "2h"
                    });
                    return res.status(200).send({ 
                        mensagem: 'Autenticado com sucesso',
                        token: token,
                        user: results[0]
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
              WHERE id = ?`,
            [
                req.body.name, 
                req.body.endereco,
                req.body.complemento,
                req.body.cidade,
                req.body.bairro,
                req.body.cep,
                req.body.telefone,
                req.body.id
            ],
            (error, result, field) => {
                conn.release();
                if (error) { return res.status(500).send({ error: error }) }
                conn.query(`SELECT * FROM users WHERE id = ?`, [req.body.id], (error, result, field) => {
                    if (error) { return res.status(500).send({ error: error }) }
                    // console.log(result);
                    result = result[0]
                    const response = {
                        mensagem: 'Suas mudanças foram salvas ! ',
                        usuarioAtualizado: {
                            id: result.id,
                            nome: result.name,
                            email: result.email,
                            endereco: result.endereco,
                            complemento: result.complemento,
                            cidade: result.cidade,
                            bairro: result.bairro,
                            cep: result.cep,
                            telefone: result.telefone,
                            imagem: result.imagem,
                        }
                    }
                    return res.status(202).send(response);
                })
                
            }
        )      
    });  
};

exports.deleteUser = (req, res, next) => {
    console.log(req.body);
    mysql.getConnection((error, conn) => {
        if (error) { return res.status(500).send({ error: error }) }
        conn.query(
            `DELETE FROM users WHERE id = ?`, [req.body.id],
            (error, result, field) => {
                conn.release();
                if (error) { return res.status(500).send({ error: error }) }
                const response = {
                    mensagem: 'Perfil removido com sucesso'
                }
                return res.status(202).send(response);
            }
        )
    });
};

exports.getUser = (req, res, next) => {
    // console.log(req.headers);
    const token = req.headers.authorization
    const jwt_payload = jwt.verify(token, process.env.JWT_KEY)
    const id = jwt_payload.id
    

    mysql.getConnection((error, conn) => {
        if (error) { return res.status(500).send({ error: error }) }
        conn.query(
            `SELECT * FROM users WHERE id = ?`, [id],
            (error, result, field) => {
                conn.release();
                if (error) { return res.status(500).send({ error: error }) }
                result = result[0]
                const response = {
                    id: result.id,
                    nome: result.name,
                    email: result.email,
                    endereco: result.endereco,
                    complemento: result.complemento,
                    cidade: result.cidade,
                    bairro: result.bairro,
                    cep: result.cep,
                    telefone: result.telefone,
                    imagem: result.imagem,
                }
                return res.status(202).send(response);
            }
        )
    });
}

exports.uploadImage = (req, res, next) => {
    const form = new formidable.IncomingForm();

    form.parse(req, (err, fields, files) => {

        if (err) res.send('Erro');

        const oldpath = files.filetoupload.filepath;
        const imageType = files.filetoupload.originalFilename.split('.')[1];
        const idUser = fields.idUser;
        if (!idUser) return res.status(401).send('Usuario não especificado')

        let imageName = `user_${idUser}.${imageType}`;
        const newpath = path.join(__dirname, '../images/users/', imageName);
        
        try {
            fs.renameSync(oldpath, newpath);

            const dirPath = `http://localhost:3000/images/users/`
            const imagePath = dirPath + imageName
            mysql.getConnection((error, conn) => {
                if (error) { return res.status(500).send({ error: error }) }
                conn.query(
                    `UPDATE users SET imagem = ? WHERE id = ?`, [imagePath, idUser],
                    (error, result, field) => {
                        conn.release();
                        if (error) { return res.status(500).send({ error: error }) }
                        console.log(result);
                        const response = {
                            message: 'Imagem atualizada com sucesso'
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