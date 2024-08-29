import { Router } from "express";
import UsersMongoDAO from "../dao/UsersMongoDAO.js";
import jwt from "jsonwebtoken";
import config from "../config/config.js";
import { enviarMail, generaHash, validaPassword } from "../utils.js"
import { isValidObjectId } from "mongoose";

const userDAO = new UsersMongoDAO();
const router = Router();

router.post("/", async (req, res)=>{
    let {email} = req.body;
    
    if(!email){
        res.setHeader("Content-Type","application/json");
        return res.status(200).json({"respuesta":"Debe ingresar un correo eléctronico"});
    }
    const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    let valido = regex.test(email);
    if(!valido){
        res.setHeader("Content-Type","application/json");
        return res.status(200).json({"respuesta":"Debe ingresar un correo eléctronico válido"});
    }
    let usuario;
    try{ usuario = await userDAO.getUsuarioBy({email});
    }
    catch(error){console.log(error)}
    if(!usuario){
        res.setHeader("Content-Type","application/json");
        return res.status(200).json({"respuesta":`No existen usuarios con ese correo electrónico :${email}`});
    }
    let SECRET = config.GITHUB_CLIENT_SECRET;
    let token = jwt.sign({email},SECRET, {expiresIn:"1h"});
    let mensaje = ` <h1>Restablecer Contraseña</h1>
                    <p>Si usted no ha solicitado restabler su contraseña, elimine este correo</p>
                    <h2>Si necesita restablecer la contraseña siga el siguiente link</h2>
                    <a href="http://localhost:8080/resetpassword/ok/?token=${token}">Restablecer contraseña</a>
                    <p>¡Este link expirara en 1 hora!</p>`;
    let enviado = await enviarMail(email,"Restablecer Contraseña", mensaje );
    
    if(!enviado){
        res.setHeader("Content-Type","application/json");
        return res.status(200).json({"respuesta":`No se logró enviar el correo electronico`});
    }
    
    res.setHeader("Content-Type","application/json");
    return res.status(200).json({"respuesta":`Recibira un correo en el Email :${email}`});
});

router.get("/ok", async (req, res)=>{
    let {token} = req.query;
    let SECRET = config.GITHUB_CLIENT_SECRET;
    if(!token){
        return res.status(400).redirect("http://localhost:8080/login");
    }
    try {
    const decodedToken = jwt.verify(token, SECRET);
    let email = decodedToken.email;
    let usuario = await userDAO.getUsuarioBy({email});
    let id = usuario._id;
    console.log(usuario, "Desde linea 60 resetRouter")
    res.setHeader("Content-Type","text/html");
    return res.status(200).send(`
        <!DOCTYPE html>
            <html lang="es">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Restablecer contraseña</title>
                </head>
                <body>
                    <h1>Restablecer Contraseña</h1>
                    <h3>Cuenta de ${usuario.first_name} ${usuario.last_name}</h3>
                    <form id="resetPass">
                        <input type="password" id="password" placeholder="password" required/>
                        <button type="submit">Cambiár contraseña</button>
                    </form>
                    <div id="mensaje"></div>
                </body>

                <script>
                    document.getElementById("resetPass").addEventListener("submit", async function(event) {
                        event.preventDefault(); // Evita que el formulario se envíe de forma tradicional
                        let password = document.getElementById("password").value;
                        let mensaje = document.getElementById("mensaje");
                        let respuesta;
                        try {
                            respuesta = await fetch("http://localhost:8080/resetpassword/", {
                            method: "PUT",
                            body: JSON.stringify({password, id:"${id}"}),
                            headers: {"Content-type": "application/json; charset=UTF-8"}
                        });
                        if(respuesta.ok){
                            let dato = await respuesta.json();
                            mensaje.innerHTML = dato.status;
                        } else {
                            let dato = await respuesta.json();
                            mensaje.innerHTML = dato.status;
                        }
                    }
                    catch(error){console.log(error)}
                        
                    });
                </script>
            </html>
        `);
    // El token es válido
    } catch (error) {
    if (error.name === 'TokenExpiredError') {
        return res.status(303).redirect("http://localhost:8080/recuperar.html");
    } else {
        return res.status(400).redirect("http://localhost:8080/login?JsonWebTokenError=true");
    }
    }
});

router.put("/", async (req, res)=>{
    let {password, id} = req.body;
    if(!password || password.length < 4 ){
        res.setHeader("Content-Type","application/json")
        return res.status(400).json({"status":"Debe ingresar un password, mínimo 4 caracteres"});
    }
    if(!isValidObjectId(id)){
        res.setHeader("Content-Type","application/json")
        return res.status(400).json({"status":"Se ha recibido un ID de usuario invalido"});
    }
    const usuario = await userDAO.getUsuarioBy({"_id":id});
    let validar = validaPassword(password, usuario.password);
    if(validar){
        res.setHeader("Content-Type","application/json")
        return res.status(400).json({"status":"La nueva contraseña no puede ser igual a la anterior"});
    }
    usuario.password = generaHash(password);
    try{
        let actualizado = await userDAO.updateUsuario(id,usuario);
        if(actualizado){
            res.setHeader("Content-Type","application/json")
            return res.status(200).json({"status":"Contraseña Actualizada"});
        }
    }
    catch(error){console.log(error.message)}
});

export default router;