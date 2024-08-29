import { ProductMockingDAO as DAO } from "../dao/ProductsMockingDAO.js"

class  MockingService {
    constructor(dao){
        this.productsDAO = dao;
    }

    async getProducts(limit=100){
        let product = [];
        for(let i = 0; i < limit; i++){
            let element = this.productsDAO.get();
            product.push(element); 
        }
        return product;
    }
}

export const mockingService = new MockingService(new DAO());