import { cartsService } from "../repository/cartsService.js";
import { productsService } from "../repository/productsService.js"
import { isValidObjectId } from "mongoose";
import { ticketsService } from "../repository/ticketsService.js";


export default class CartsController {
    static purchase = async(req, res) => {
        if(!req.session.usuario){
            res.setHeader('Content-Type','application/json');
            return res.status(400).json({error:`Debe haber un cliente logueado`});
        }
        let {cid} = req.params;
        if(!cid || !isValidObjectId(cid) ){
            res.setHeader('Content-Type','application/json');
            return res.status(400).json({error:`Hace falta un id valido de carrito`});
        }
        if(req.session.usuario.cart =! cid){
            res.setHeader('Content-Type','application/json');
            return res.status(400).json({error:`Este carrito no pertenece al usuario logeado`});
        }
        let carrito = await cartsService.getCartByID_Populate(cid);
        if(carrito.products.length === 0){
            res.setHeader('Content-Type','application/json');
            return res.status(400).json({error:`No hay productos en carrito para facturar`});
        }
        
        let amount = 0;
        carrito.products.forEach(producto => {
            amount +=  producto.quantity * producto.productId.price;
        });
        

        let purchaser = req.session.usuario.email;
        let code = new Date().getTime();
        let purchase_datetime = new Date();
        
        //El Stock se verificó antes de agregarlo al carrito ✅
        carrito.products = [];

        let ticket = {code, purchase_datetime, amount, purchaser}
        let Newticket = await ticketsService.createNewTicket(ticket);
        let eliminarProductos = await cartsService.updateCart(cid, carrito);
        //console.log(eliminarProductos);

        res.setHeader('Content-Type','application/json');
        return res.status(200).json({succes:Newticket, message:`Muchas gracias por su compra ✅`});
    }

    static getCart = async (request, response) => {
        try {
            let carrito = await cartsService.getCarts();
            if(carrito){
                response.setHeader('Content-Type','application/json');
                return response.status(200).json(carrito);
            } else {
                response.setHeader('Content-Type','application/json');
                return response.status(400).json({error:`No hay carritos activos ❌`});
            }
        }
        catch(error){
            console.log(error);
            response.setHeader('Content-Type','application/json');
            return response.status(500).json({
                error:"Error inesperado en el servidor - intente más tarde",
                detalle:`${error.message}`});
            
        } 
    }

    static getCartById = async(request, response) => {
        let {cid} = request.params;
        
        if(!isValidObjectId(cid)){
            response.setHeader('Content-Type','application/json');
            return response.status(400).json({error:"Ingrese un ID Valido de Mongo"});
        } else {
            try {
                let carrito = await cartsService.getCartByID_Populate(cid);
                if(carrito){
                    response.setHeader('Content-Type','application/json');
                    return response.status(200).json(carrito.products);
                } else {
                    response.setHeader('Content-Type','application/json');
                    return response.status(400).json({error:`No existe carrito con el ID ${cid}`});
                }
            }
            catch(error){
                console.log(error);
                response.setHeader('Content-Type','application/json');
                return response.status(500).json({
                    error:"Error inesperado en el servidor - intente más tarde",
                    detalle:`${error.message}`});
            } 
        }
    }

    static createCart = async(request, response) => {
        let {products} = request.body; 
        if(!products){
            response.setHeader('Content-Type','application/json');
            return response.status(400).json({status:"error", error:"Debe Agregar productos al carrito"});
        }

        try {
            let agregado = await cartsService.createNewCart({products});
            if(agregado){
                response.setHeader('Content-Type','application/json');
                return response.status(201).json(agregado);
            } else {
                response.setHeader('Content-Type','application/json');
                response.status(400).json({status:"error", message:"El producto no se pudo agregar"})
            }
        } 
        catch(error){
            console.log(error);
            response.setHeader('Content-Type','application/json');
            return response.status(500).json({
                error:"Error inesperado en el servidor - intente más tarde",
                detalle:`${error.message}`});
        }
        
    }

    static modifyProductById = async(request, response) => {
        let products = request.body;
        let {cid} = request.params;  //[{productId:"x",quantity:1},{productId:"y",quantity:1},{productId:"z",quantity:1}]
        if(!products){
            response.setHeader('Content-Type','application/json');
            return response.status(400).json({error:"Debe Agregar productos al carrito"});
        }
        if(!isValidObjectId(cid)){
            response.setHeader('Content-Type','application/json');
            return response.status(400).json({error:"Debe ingresar un Id Mongo Valido"});
        }
        // crear Array de pid´s recibidos para agregar
        let pids = products.map(produ => produ.productId);
        let carrito;
        try {
            carrito = await cartsService.getCartByID_Populate(cid);
        }
        catch(error){console.log(error.message)}
        
        const ArrayCarrito = carrito.products; 

        const productosPreExistentes = pids.filter(pidElement => {
            return ArrayCarrito.some(produ => produ.productId._id == pidElement);
        }); 

        if(productosPreExistentes == 0){
            try {
                let ProductosNormalizados = [];
                for (const produ of products) {
                    let produActual = await productsService.getProductBy({"_id": produ.productId}); 

                    let quantity = produ.quantity; //modificado 12 de agosto
                    ProductosNormalizados.push({"productId": produActual, "quantity": quantity});
                }
                let Updated = [...ArrayCarrito, ...ProductosNormalizados];                
                let resuelto = await cartsService.updateCart(cid,{$set:{"products":Updated}});
                if(resuelto){
                    response.setHeader('Content-Type','application/json');
                    return response.status(200).json({status:"Productos Agregados"});
                } else {
                    response.setHeader('Content-Type','application/json');
                    response.status(400).json({error:"El producto no se pudo agregar"})
                }    
            } catch(error){console.log(error);}            
        } else {
            console.log(ArrayCarrito," ArrayCarrito Desde 137");//Carrito en BD
            for (const compra of products) {
                const index = ArrayCarrito.findIndex(producto => compra.productId == producto.productId._id);
                if (index !== -1) {
                    // Producto encontrado, actualizamos la cantidad
                    ArrayCarrito[index].quantity += compra.quantity;
                } else {
                    // Producto no encontrado, lo agregamos al carrito
                    ArrayCarrito.push(compra);
                }
            }
            try {
                let resuelto = await cartsService.updateCart(cid,{$set:{"products":ArrayCarrito}});
                if(resuelto){
                    response.setHeader('Content-Type','application/json');
                    return response.status(200).json({succes:"Productos agregado con existo"});
                }
            }
            catch(error){error.message}
        }
        response.setHeader('Content-Type','application/json');
        return response.status(400).json({error:"No se logro agregar los productos"});
    }

    static modifyCartProducsById = async(request, response) => {
        let {cid,pid }= request.params
        let {cantidad} = request.body;
        
        cantidad = Number(cantidad);
        if(!cantidad || typeof cantidad != "number"){
            cantidad = 1;
        }
        if(!isValidObjectId(cid) || !isValidObjectId(pid) ){
            response.setHeader('Content-Type','application/json');
            return response.status(400).json({error:"Verifique que los IDs ingresados sean validos"});
        } 
        
        let carrito;
        try {
            carrito = await cartsService.getCartByID_Populate(cid);
            if(!carrito){
                response.setHeader('Content-Type','application/json');
                return response.status(400).json({error:`El carrito con ID: ${cid} no existe`});
            }
        }
        catch(error) {
            console.log(error.message)
        }
        let producto;
        try {
            producto = await productsService.getProductBy({_id:pid});
            if(!producto){
                response.setHeader('Content-Type','application/json');
                return response.status(400).json({error:`El producto con ID: ${pid} no existe`});
            }
        }
        catch(error) {
            console.log(error.message)
        }
        //consultar stock actual del producto
        if(producto.stock <= 0){
            response.setHeader('Content-Type','application/json');
            return response.status(400).json({error:`No hay suficiente stock disponible del producto con ID: ${pid}`});
        }
        if(producto.stock < cantidad){
            response.setHeader('Content-Type','application/json');
            return response.status(400).json({error:`Solo hay ${producto.stock} items del producto ${pid} y usted pidio ${cantidad}`});
        }

        const ProductoEnCarrito = carrito.products.find(produ => produ.productId._id == pid);
        if(ProductoEnCarrito){
            try {
                let stockActualizado = await productsService.updateProduct(pid, {"$inc":{"stock":-cantidad}});
                
                if(stockActualizado){ 
                    ProductoEnCarrito.quantity = ProductoEnCarrito.quantity + cantidad ;
                }
            }
            catch(error){error.message} 
            
        } else {    
            try {
                let stockActualizado = await productsService.updateProduct(pid, {"$inc":{"stock":-cantidad}});
                if(stockActualizado){
                    carrito.products.push({"productId": pid, "quantity":cantidad});
                }
            }
            catch(error){
                response.setHeader('Content-Type','application/json');
                return response.status(400).json({error:`Error inesperado en el servidor intente nuevamente`});
            }
            
        }
            try {
                let resuelto = await cartsService.updateCart(cid, carrito);
                if(resuelto){
                    response.setHeader('Content-Type','application/json');
                    return response.status(200).json({succes:`${cantidad} Producto/s ${pid}, agregado/s en carrito ${cid}`});
                }
            }
            catch(error){
                error.message
                response.setHeader('Content-Type','application/json');
                return response.status(400).json({error:`Error inesperado en el servidor al intentar agregar productos al carrito`});
            }
    }

    static deleteCartById = async(req, res) => {
        let {cid} = req.params;
        if(isValidObjectId(cid)){
            let carrito = await cartsService.getCartByID_Populate(cid);
            if(!carrito){
                res.setHeader('Content-Type','application/json');
                return res.status(400).json({erro:`No existe carrito con ID ${cid}`});
            }
            let productosEnCarrito = carrito.products;
            for (const producto of productosEnCarrito){
                let pid = producto.productId._id;
                let cantidad =  producto.quantity;
                let elemento = await productsService.getProductBy({_id:pid});
                elemento.stock += cantidad;
                await productsService.updateProduct(pid, elemento);
            }
            try {
                let Eliminado = await cartsService.deleteCart(cid);
                if(Eliminado){
                    res.setHeader('Content-Type','application/json');
                    return res.status(200).json({status:"succes", Eliminado});
                } 
            }
            catch(error){
                console.log({error:`Error Al intentar Eliminar el  carrito con ID ${cid}`});
            }
        }
    }

    static deleteProductFromCart = async(request, response) => {
        let { cid,pid } = request.params;
        let { cantidad } = request.body;

        cantidad = Number(cantidad);
        if(!cantidad || typeof cantidad != "number"){
            cantidad = 1;
        }

        if(!isValidObjectId(cid) || !isValidObjectId(pid) ){
            response.setHeader('Content-Type','application/json');
            return response.status(400).json({error:"Ingrese un ID de Carrito y ID de Producto validos"});
        } 
        let carrito;
        try {
            carrito = await cartsService.getCartByID_Populate(cid);
            if(!carrito){
                response.setHeader('Content-Type','application/json');
                return response.status(400).json({error:`El carrito con ID: ${cid} no existe`});
            }
        }
        catch(error) {
            console.log(error.message)
        }
        let producto;
        try {
            producto = await productsService.getProductBy({_id:pid});
            if(!producto){
                response.setHeader('Content-Type','application/json');
                return response.status(400).json({error:`El producto con ID: ${pid} no existe`});
            }
        }
        catch(error) {
            console.log(error.message)
        }
        const ProductoEnCarrito = carrito.products.find(produ => produ.productId._id == pid);
        if(!ProductoEnCarrito){
            response.setHeader('Content-Type','application/json');
            return response.status(400).json({error:`No existe producto ${pid} en el carrito ${cid}`});
        }
        if(ProductoEnCarrito.quantity >= cantidad){
            try {
                await productsService.updateProduct(pid, {"$inc":{"stock":cantidad}});
                ProductoEnCarrito.quantity = ProductoEnCarrito.quantity - cantidad;
            }
            catch(error){error.message}
        } else if(ProductoEnCarrito.quantity < cantidad){
            response.setHeader('Content-Type','application/json');
            return response.status(400).json({error:`No se pueden eliminar más productos de los que hay en el carrito ${cid}`});
        }
        if(ProductoEnCarrito.quantity < 1){
                carrito.products = carrito.products.filter(produ => produ.productId._id != pid);
        }
        try {
            let resuelto = await cartsService.updateCart(cid, carrito);
            if(resuelto){
                response.setHeader('Content-Type','application/json');
                return response.status(200).json({"succes":`Se elimino: ${cantidad} Producto/s ${pid} del carrito ${cid}`});
            }
        }
        catch(error){
            error.message
            response.setHeader('Content-Type','application/json');
            return response.status(400).json({error:`Error inesperado en el servidor intentando borrar un producto del carrito`});
        }
    }
}
