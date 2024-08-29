import { mockingService } from "../repository/mockingService.js";

export default class MockingController {

    static getProducts = async(req, res) => {
        let { limit } = req.query;
        let product;
        if(limit){
            limit = Number(limit);
            if (isNaN(limit)){
                res.setHeader('Content-Type','application/json');
            return res.status(400).json({status:"error", message: "limit debe ser un numero valido"});
            }
            product = await mockingService.getProducts(limit);
            
            if(limit === 1){ 
                res.setHeader('Content-Type','application/json');
            return res.status(200).json({ product: product[0]});
            } else {
                res.setHeader('Content-Type','application/json');
            return res.status(200).json({status:"succes", payload: product});
            }
        } else {
            product = await mockingService.getProducts();
            res.setHeader('Content-Type','application/json');
            return res.status(200).json({status:"succes", payload: product});
        }
        
    }

    static createProduct = (req, res) => {
        let {title, description, price, code, stock } = req.body;
        if(!title){
            CustomError.createrError("Argumento title faltante", argumentosProducts(req.body), "Complete la propiedad title", TIPOS_ERROR.ARGUMENTOS_INVALIDOS);
        }
        if(!price){
            CustomError.createrError("Argumento price faltante", argumentosProducts(req.body), "Complete la  propiedad price", TIPOS_ERROR.ARGUMENTOS_INVALIDOS);
        }
        let producto = {title, description, price, code, stock };
        res.setHeader("Content-Type","application/json");
        return res.status(200).json({status:"succes", payload: producto});
        
    }


}