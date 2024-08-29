import cartsModelo from "./models/CartModel.js";

export class CartsMongoDAO {

    async get(limit){
        try {
            return await cartsModelo.find().limit(limit).lean();
        }
        catch(error){
            console.log(error,"Error desde getCarritos");
        }
    }

    async getBy(filter){
        return await cartsModelo.find(filter).lean();
    }

    async create(cart){
        try {
            return await cartsModelo.create(cart);
        }
        catch(error){
            console.log(error,"Error desde crearCarrito");
        }
    }

    async getById_Populate(cid){
        try {
            return await cartsModelo.findById({_id:cid}).populate("products.productId").lean(); //{_id:cid}
        } 
        catch(error){console.log(error, "Error en el getCarritoById")}
    }

    async getById_Not_Populate(cid){
        try {
            return await cartsModelo.findById({_id:cid}).lean(); //{_id:cid}
        } 
        catch(error){console.log(error, "Error en el getCarritoById")}
    }

    async update(cid, update){
        try {
            return await cartsModelo.findByIdAndUpdate({"_id":cid}, update,{runValidators:true, new:true, upsert:true});
        }
        catch(error){
            console.log(error.message ,"Error desde updateCart");
        }
    }

    async delete(cid){
        try {
            return await cartsModelo.findByIdAndDelete(cid);
        }
        catch(error){
            console.log(error,"Error desde deleteProduct")
        }
    }
}