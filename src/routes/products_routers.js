import { Router } from "express";
import ProductsController from "../controller/ProductsController.js";
import { uploader } from "../utils.js";
import auth from "../middleware/auth.js";
//import { CustomError } from "../utils/CustomError.js";
//import { argumentosProducts } from "../utils/erroresProducts.js";
//import { TIPOS_ERROR } from "../utils/EErrors.js";

const router = Router();

const entorno = async () => {

    router.get("/",ProductsController.getProducts);

    router.get("/:pid", ProductsController.getProductByPID);
    
    router.post("/", uploader.single('thumbnail'), auth, ProductsController.createProduct );

    router.put("/", auth,(req, res) => {
        res.setHeader('Content-Type','application/json');
        return res.status(400).json({error:`Debe ingresar el ID del producto a modificar`});
    });

    router.put("/:pid", auth, ProductsController.modifyProduct);

    router.delete("/", auth, async(request, response) => {
        response.setHeader('Content-Type','application/json');
        return response.status(400).json({error:`Debe ingresar el ID del producto a eliminar`});
    });

    router.delete("/:pid", auth, ProductsController.deleteProduct);

}

entorno();

export default router;