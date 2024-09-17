import { Router } from "express";
import { isValidObjectId } from "mongoose";
import UsersMongoDAO from "../dao/UsersMongoDAO.js";
import { CartsMongoDAO } from "../dao/CartsMongoDAO.js";
import { ProductsMongoDAO } from "../dao/ProductsMongoDAO.js";
import { uploaderDocuments } from "../utils.js";
import fs from "fs";
import { enviarMail } from "../utils.js";

const userDAO = new UsersMongoDAO();
const cartDAO = new CartsMongoDAO();
const productDAO = new ProductsMongoDAO();

const router = Router();

router.delete("/", async(req, res) => {
    let usuarios = await userDAO.getUsuarios();
    let now = new Date();
    let carritos = [];
    let usuariosEliminados = [];
    const MaximoSinConectar = (48*60*60*1000);

    let superoTiempo = (user) => {
        if( ((now.getTime() - user.last_connection.getTime()) > MaximoSinConectar)){ 
            return true;
        } else { return false; }
    }

    usuarios.forEach( async(user) => {
        if (superoTiempo(user)){
            carritos.push(user.cart); 
            let mail = user.email;
            let name = `${user.first_name} ${user.last_name}`;

            console.log((now.getTime() - user.last_connection.getTime())/60000, "Minutos desde la última conexión",`El usuario con su correo ${mail} se eliminarán`);

            try { 
                let usuarioBorrado = await userDAO.deleteUsuario(user._id); 
                if(usuarioBorrado){
                    usuariosEliminados.push(mail);
                    let enviado = await enviarMail(mail,"Aviso de Usuario Eliminado",`Estimado/a ${name} lo hemos eliminado de nuestra Base de Datos por no visitarnos por más de 48hs`);
                    if(enviado.accepted.length > 0){ 
                        req.logger.debug(`Usuario ${name} informado mediante mail a ${mail}`);
                    }
                } else { 
                    req.logger.error(`No se logro borrar el usuario ${mail}`);
                }
            }
            catch(error){
                req.logger.error(error,`Error al intentar eliminar al usuario ${mail}`);
            }
        }
    });

    carritos.forEach( async(cart) => {
        let carro = await cartDAO.getById_Populate(cart);

        if(carro.products.length === 0){ //Si el carro no tiene productos
            try { 
                let carritoBorrado = await cartDAO.delete(carro._id);
                if(carritoBorrado){
                    req.logger.debug(`Carrito ${carro._id} estaba vacio y fue eliminado`);
                }
            }
            catch(error){ 
                req.logger.error(error, `Error al intentar borrar el carro ${carro._id}`);
            }
        } else { //Si el carro, si tiene productos

            carro.products.forEach( async(produc) => {

                if(produc.productId !== null){
                    let _id = produc.productId._id;
                    let cantidad = produc.quantity;
                    
                    try { 
                        let productoActualizado = await productDAO.update(_id,{$inc:{stock:cantidad}});
                        if(productoActualizado){
                            req.logger.debug(`Producto ${_id} actualizado Correctamente`,productoActualizado);
                        }
                    }
                    catch(error){
                        req.logger.error(`Error al intentar actualizar producto: ${_id} por cantidad ${cantidad}`);
                    }
                } 
            });

            try { await cartDAO.delete(carro._id) }
            catch(error){console.log(`Error al intentar eliminar carro ${carro._id}`)}

        }
    });
    
    res.setHeader("Content-Type","application/json");
    return res.status(200).json({"status":`Se han eliminado ${usuariosEliminados.length} usuarios`});
});

router.get("/", async(req, res) => {
    class UsuarioDTO {
        constructor(usuario){
            this.first_name = usuario.first_name;
            this.last_name = usuario.last_name;
            this.email = usuario.email;
            this.rol = usuario.rol;
        }
    }
    let usuarios = await userDAO.getUsuarios();
    let usuariosDTO = usuarios.map(user => {
        let usuarioDTO = new UsuarioDTO(user);
        return {...usuarioDTO}
    });

    res.setHeader("Content-Type","application/json");
    return res.status(200).json({"status":usuariosDTO});
});

router.post(`/:uid/documents`, uploaderDocuments.array(`documents`) , async(req, res) => {
    let {name} = req.body;
    let {uid}= req.params;
    let archivos = req.files;
    if(archivos.length === 0){
        res.setHeader("Content-Type","Application/json");
        return res.status(400).json({ "status": "Error No hay archivos para agregar"});
    }
    let documentosValidos = ["identificación", "comprobante de domicilio", "comprobante de estado de cuenta"];

    if(!isValidObjectId(uid)){
        res.setHeader("Content-Type","Application/json");
        return res.status(400).json({ "status": "Error User ID inválido"});
    }
    let user = await userDAO.getUsuarioBy({"_id":uid});
    name = JSON.parse(name);
    
    if(!(archivos.length === name.length)){
        res.setHeader("Content-Type","Application/json");
        return res.status(400).json({ "status": "Error Cada documento debe venir con nombre"});
    }
    let counter = -1;
    archivos.forEach(document => {
        counter++;
        if(documentosValidos.includes(name[counter].toLowerCase())){
            if(!user.documents.find(doc => doc.name === name[counter])){
                user.documents.push({"name":name[counter],"reference": document.path}) ; 
            } 
        } else { fs.unlink(document.path, function (err) {
            if (err) throw err;
            console.log('Archivo Borrado!');
        }); }
    });
    let actualizado = await userDAO.updateUsuario(uid,user);
    if(actualizado){
        res.setHeader("Content-Type","Application/json");
        return res.status(200).json({ "status": "success cliente actualizado"});
    }
    res.setHeader("Content-Type","Application/json");
    return res.status(200).json({ "status": "success No se pudo actualizar"});
});

router.get("/premium/:uid",async(req, res)=>{
    const {uid} = req.params;
    if(!isValidObjectId(uid)){
        res.setHeader("Content-Type","application/json");
        return res.status(400).json({"status":"Error, Debe ingresar un Id de usuario válido"});
    }
    try {
        const usuario = await userDAO.getUsuarioBy({"_id":uid});
        let actualizar;
        if(!usuario){
            res.setHeader("Content-Type","application/json");
            return res.status(400).json({"status":`Error, No existe usuario con el ID ${uid}`});
        }
        
        if(usuario.rol === "user"){
            if(usuario.documents.length < 3){
                res.setHeader("Content-Type","application/json");
                return res.status(400).json({"status":`Error, Usuario no terminado de procesar su documentación`});
            }
            usuario.rol = "premium";
            actualizar = await userDAO.updateUsuario(uid,usuario);
            if(!actualizar){
                res.setHeader("Content-Type","application/json");
                return res.status(400).json({"status":`Error, No se pudo actualizar el usuario`});
            }
            res.setHeader("Content-Type","application/json");
            return res.status(200).json({"status":`Rol del usuario ${usuario.first_name} ${usuario.last_name} actualizado por ${usuario.rol}`});
        } else if(usuario.rol === "premium"){
            usuario.rol = "user";
            actualizar = await userDAO.updateUsuario(uid,usuario);
            if(!actualizar){
                res.setHeader("Content-Type","application/json");
                return res.status(400).json({"status":`Error, No se pudo actualizar el usuario`});
            }
            res.setHeader("Content-Type","application/json");
            return res.status(200).json({"status":`Rol del usuario ${usuario.first_name} ${usuario.last_name} actualizado por ${usuario.rol}`});
        } else {
            let rol = usuario.rol;
            res.setHeader("Content-Type","application/json");
            return res.status(400).json({"status":`Error, El rol de este usuario es ${rol} y no es modificable`});
        }
    }
    catch(error){
        console.log(error);
        res.setHeader("Content-Type","application/json");
        return res.status(400).json({"status":"Error inesperado en el servidor"});
    }
});

export default router;