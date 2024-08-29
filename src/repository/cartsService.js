import { CartsMongoDAO as DAO} from "../dao/CartsMongoDAO.js"

class CartsService {
    constructor(dao){
        this.CartsDao = dao;
    }

    async getCarts(limit=10){
        return await this.CartsDao.get(limit);
    }

    async getCartBy(filter){
        return await this.CartsDao.getBy(filter);
    }

    async getCartByID_Populate(cid){
        return await this.CartsDao.getById_Populate(cid)
    }

    async getCartsById_NotPopulate(cid){
        return await this.CartsDao.getById_Not_Populate(cid);
    }

    async createNewCart(NewCart){
        return await this.CartsDao.create(NewCart);
    }

    async updateCart(cid, update){
        return await this.CartsDao.update(cid, update);
    }

    async deleteCart(cid){
        return await this.CartsDao.delete(cid);
    }
}

export const cartsService = new CartsService(new DAO());