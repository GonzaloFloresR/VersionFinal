import { loggers } from "winston";
import usuariosModelo from "./models/UsuarioModel.js";

export default class UsersMongoDAO {

    async createUsuario(usuario){
        let nuevoUsuario = await usuariosModelo.create(usuario);
        return nuevoUsuario.toJSON();
    }

    async getUsuarioBy(filtro={},proyeccion={}){
        return await usuariosModelo.findOne(filtro,proyeccion).lean();
    }

    async updateUsuario(id, Update){
        try {
            let update = await usuariosModelo.findByIdAndUpdate({"_id":id},Update,{runValidators:true, returnDocument:"after"});
            return update.toJSON();
        }
        catch(error){
            console.log(error, "Error desde updateProduct");
        }
    }

    async getUsuarios(){
        try {
            return await usuariosModelo.find().lean();
        }
        catch(error){
            console.log(error,"Error desde getUsuarios");
        }
    }

    async deleteUsuario(id){
        try {
            return await usuariosModelo.deleteOne({_id:id}).lean();
        }
        catch(error){
            console.log(error.message);
        }
        
    }

}
