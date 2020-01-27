const Usuario = require('../models/Usuario');
const bcryptjs = require('bcryptjs');
const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');

exports.autenticarUsuario = async (req, res) => {
    //revisar si hay errores
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({errors : errors.array()})
    }

    //extraer el password y el usuario
    const {email, password} = req.body;

    try {
        //revisar que sea un usuario registrado
        let usuario = await Usuario.findOne({email});
        if(!usuario) {
            return res.status(400).json({msg: 'El usuario no existe'});
        }

        //revisar el password
        const passCorrecto = await bcryptjs.compare(password, usuario.password);
        if(!passCorrecto) {
            return res.status(400).json({msg : 'Password incorrecto'})
        }

        //si todo es correcto crear y firmar el JWT
        const payload = {
            usuario: {
                id: usuario.id
            }
        };

        //firmar el jwt
        jwt.sign(payload, process.env.SECRETA, {
            expiresIn: 3600000, //1 hora
        }, (error, token) => {
            if(error) throw error;

            //mensaje de confirmacion
            res.send({token});
        });

    } catch (error) {
        console.log(error);
    }

}

//obtiene que usuario esta autenticado
exports.usuarioAutenticado = async (req, res) => {
    try {
       const usuario = await Usuario.findById(req.usuario.id).select('-password');
       res.json({usuario});
    } catch (error) {
        console.log(error);
        res.status(500).json({msg : 'Hubo un error'});
    }
}