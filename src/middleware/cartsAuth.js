import { isValidObjectId } from "mongoose";
import { productsService } from "../repository/productsService.js";


const cartsAuth = async (req, res, next) => {
    if(!req.session.usuario){
        res.setHeader("Content-Type","application/json");
        return res.status(401).json({"error":"No existen usuarios autenticados"});
    }
    let usuario = req.session.usuario;

    if(req.originalUrl == "/chat"){
        if(usuario.rol === "admin"){
            res.setHeader("Content-Type","application/json");
            return res.status(401).json({"error":"El Administrador no puede acceder al chat"});
        } 
        return next();
    }
    
    let {cid, pid} = req.params;
    
    if(cid){
        if(!isValidObjectId(cid)){
            res.setHeader("Content-Type","application/json");
            return res.status(401).json({"error":"Debe ingresar un Id de carrito válido"});
        }

        if(usuario.rol == "admin"){
            console.log("desde linea 29", usuario.rol);
            return next();
        }

        if(usuario.cart != cid){
            console.log("desde linea 34 igual llego aquí");
            res.setHeader("Content-Type","application/json");
            return res.status(400).json({"error":"Solo puede agregar productos a su propio carrito"});
        }

        if(pid){
            if(!isValidObjectId(pid)){
                res.setHeader("Content-Type","application/json");
                return res.status(400).json({"error":"Debe ingresar un Id de producto válido"});
            }
            let producto;
            try {
                producto = await productsService.getProductBy({"_id":pid});
                if(!producto){
                    res.setHeader("Content-Type","application/json");
                    return res.status(400).json({"error":`No existe producto con el Id ${pid}`});
                }
                if(usuario.rol === "premium" && producto.owner == usuario._id){
                        res.setHeader("Content-Type","application/json");
                        return res.status(400).json({"error":`Usted es Owner de este Producto, no puede agregarlo al carrito`});
                } else {
                    return next();
                }
            }
            catch(error){
                console.log(error);
                
            }
        } 
    }
}

export default cartsAuth;