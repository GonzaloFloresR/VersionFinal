import { isValidObjectId } from "mongoose";
import { productsService } from "../repository/productsService.js";
import UsersMongoDAO from "../dao/UsersMongoDAO.js";
const userDAO = new UsersMongoDAO();

const auth = async(req, res, next) => {
    if(!req.session.usuario){
        res.setHeader("Content-Type","application/json");
        return res.status(401).json({error:"No existen usuarios autenticados"});
    }
    let usuario = req.session.usuario;
    let requestMethod = req.method;
    
    if(requestMethod === "GET"){
        next();
    }

    if (['POST', 'PUT', 'DELETE'].includes(requestMethod)){
        if(usuario.rol === "user"){
            res.setHeader("Content-Type","application/json");
            return res.status(401).json({error:"Solo admin o Premium pueden acceder"});
        }
        //Agregando Código Dom 28 Julio
        if(['PUT', 'DELETE'].includes(requestMethod)){
            let {pid} = req.params;
            let producto;
            if(!isValidObjectId(pid)){
                res.setHeader('Content-Type','application/json');
                return res.status(400).json({error:"Ingrese un ID Valido para MongoDB"});
            }
            try {
                producto = await productsService.getProductBy({"_id":pid});
                if(!producto){
                    res.setHeader('Content-Type','application/json');
                    return res.status(400).json({error:"No existe producto con ese ID"});
                }
                const owner = producto.owner;
                if(usuario._id == owner || usuario.rol === "admin"){
                    next();
                } else {
                    res.setHeader('Content-Type','application/json');
                    return res.status(500).json({error:`Solo el Owner del producto o un admin puede modificar el producto`});
                }
            } catch(error){
                console.log(error);
                res.setHeader('Content-Type','application/json');
                return res.status(500).json({error:`Error inesperado en el servidor`,detalle:`${error.message}`});
            }
        }
        if(['POST'].includes(requestMethod)){
            if(usuario.rol != "premium" && usuario.rol != "admin" ){
                res.setHeader("Content-Type","application/json");
                return res.status(401).json({error:"Solo admin o Premium pueden acceder"});
            } else {
                return next();
            }
        }
        
        //Cerrando Modificación 28 Julio
        // if(usuario.rol === "admin" || usuario.rol ==="premium"){
        //     next();
        // } else {
        //     // Denegar acceso si el usuario no tiene rol "admin"
        //     res.setHeader('Content-Type','application/json');
        //     return res.status(403).json({ error: 'Acceso denegado. Se requiere rol de administrador.' });
        // }
    }
}

export default auth;