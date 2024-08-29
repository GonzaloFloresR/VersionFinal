import { Router} from "express";
//import { generaProducts } from "../utils.js";
import MockingController from "../controller/mockingController.js";

const router = Router();

const entorno = async() => {
    
    router.get("/", MockingController.getProducts);
    
    
    router.post("/", MockingController.createProduct);
}

entorno();


export default router;