import { Router } from"express";
import auth from"../middleware/auth.js";
import ViewController from "../controller/ViewController.js";
import cartsAuth from "../middleware/cartsAuth.js";


const router = Router();

router.get("/registro", (req, res, next) => {
    if(req.session.usuario){
        return res.redirect("/perfil");
    }
    next();
}, ViewController.getRegistro);

router.get("/login",(req, res, next) => {
    if(req.session.usuario){
        return res.redirect("/perfil");
    }
    next();
}, ViewController.getLogin);

router.get("/perfil", auth, ViewController.getPerfil);

router.get("/chat", cartsAuth,ViewController.getChat);

router.get("/home", ViewController.getHome);

router.get("/realtimeproducts", ViewController.getRealTimeProducts);

router.get("/products", auth, ViewController.getProducts);

router.get("/carrito/:cid", auth, ViewController.getCartById);

router.get("/carrito", async(req, res) => {
    res.setHeader('Content-Type','application/json');
    return res.status(404).json({error:"Error 404"});
});

export default router;