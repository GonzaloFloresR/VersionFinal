import { Router } from "express";
import passport from "passport";
import  auth from "../middleware/auth.js";
import { UsuarioDTO } from "../dto/UsuarioDTO.js";
import UsersMongoDAO from "../dao/UsersMongoDAO.js";

let UsersDao = new UsersMongoDAO();

const router = Router();

router.get("/error",(req, res) => {
    res.setHeader("Content-Type","application/json");
    return res.status(401).json({error:"Fallos al autenticar"});
});

router.get("/github", passport.authenticate("github",{}),(req, res) => {
});

router.get("/callbackGithub", passport.authenticate("github",{failureRedirect:"/api/sessions/error"}),(req, res) => {
    let usuario = new UsuarioDTO({...req.user});
    req.session.usuario = {...usuario}
    return res.status(200).redirect("/products");
});

router.post("/registro", passport.authenticate("registro",{failureRedirect:"/api/sessions/error"}), async (req, res) => {
    return res.status(201).redirect("/login");
});

router.post("/login", passport.authenticate("login",{failureRedirect:"/api/sessions/error"}), async(req, res) => {
    let usuario = req.user;
    usuario.last_connection = new Date();

    let usuarioActualizado = await UsersDao.updateUsuario(usuario._id, usuario);
    usuario = new UsuarioDTO({...usuarioActualizado});    
    req.session.usuario = {...usuario};

    res.setHeader("Content-Type","application/json");
    return res.status(200).json({status:"success", data:usuario});
});

router.get("/logout",(req, res) => {
    req.session.destroy(error => {
        if(error){console.log(error);
            res.setHeader("Content-Type","application/json");
            return res.status(500).json({error:"Error inesperado en el servidor", detalle:`${error.message}`});
        }
    })
    //return res.status(200).redirect("/login");//Tengo que cambiar esto
    res.setHeader("Content-Type","application/json");
    return res.status(200).json({status:"success", message:"Usuario deslogueado"});
});

router.get("/current", auth,(req, res)=>{
    let usuario = req.session.usuario;
    res.setHeader("Content-Type","application/json");
    return res.status(200).json({usuario});
});

router.get("*", (req, res) => {
    res.setHeader("Content-Type","application/json");
    return res.status(404).json({error:"Recurso no Encontrato"});
});

export default router;
