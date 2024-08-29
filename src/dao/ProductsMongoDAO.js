import productoModelo from "./models/ProductModel.js";

export class ProductsMongoDAO {
    
    async get(limit,page,sort, filter){
        try {
            return await productoModelo.paginate({},{limit, page, sort:{[filter]:sort}, lean:true});
        }
        catch(error){
            console.log(error,"Error desde getProducts");
        }
    }

    async getBy(filtro){
        try {
            return await productoModelo.findOne(filtro).lean();
        } catch(error){
            console.log(error,"Error desde getProductBy")
        }
    } 

    async add(nuevoProducto){ 
        try {
                let ProductoNuevo =  await productoModelo.create(nuevoProducto);
                return ProductoNuevo.toJSON();
            }
        catch(error){
                console.log(error,"Error desde addProduct");
            }
    }

    async update(id, Update){
        try {
            return await productoModelo.findByIdAndUpdate({"_id":id},Update,{runValidators:true, returnDocument:"after"});
        }
        catch(error){
            console.log(error, "Error desde updateProduct");
        }
    }

    async delete(pid){
        try {
            return await productoModelo.deleteOne(pid);
        }
        catch(error){
            console.log(error,"Error desde deleteProduct")
        }
    }
}
