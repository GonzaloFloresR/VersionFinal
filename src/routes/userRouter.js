import { Router } from "express";
import { isValidObjectId } from "mongoose";
import UsersMongoDAO from "../dao/UsersMongoDAO.js";
import { uploaderDocuments } from "../utils.js";
import fs from "fs";

const userDAO = new UsersMongoDAO();

const router = Router();

router.get("/", (req, res)=>{
    res.setHeader("Content-Type","application/json");
    return res.status(400).json({"status":`Error, Debe ingresar un Id de usuario válido`});
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