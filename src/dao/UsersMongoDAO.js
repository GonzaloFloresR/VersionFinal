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
            return await usuariosModelo.findByIdAndUpdate({"_id":id},Update,{runValidators:true, returnDocument:"after"});
        }
        catch(error){
            console.log(error, "Error desde updateProduct");
        }
    }
}
