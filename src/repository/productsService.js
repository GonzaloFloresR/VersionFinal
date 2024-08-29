import { ProductsMongoDAO as DAO } from "../dao/ProductsMongoDAO.js";

class ProductsService {
    constructor(dao){
        this.productsDAO = dao;
    }

    async getProducts(limit=10,page=1,sort){
        let filter;
        if(sort){ filter="price";} else {filter="_id"; sort=1;} 
        let products = await this.productsDAO.get(limit, page, sort, filter);
        return products;
    }

    async getProductBy(filtro){
        let product = await this.productsDAO.getBy(filtro);
        return product;
    }

    async addProduct(product){ 
        let NuevoProducto = await this.productsDAO.add(product);
        return NuevoProducto;
    }

    async updateProduct(id, Update){
        let producto = await this.productsDAO.update(id, Update);
        return producto;
    }

    async deleteProduct(pid){
        return await this.productsDAO.delete(pid);
    }
}

export const productsService = new ProductsService(new DAO());