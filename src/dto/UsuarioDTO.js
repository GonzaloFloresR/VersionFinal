export class UsuarioDTO {
    constructor(usuario){
        this._id = usuario._id;
        this.first_name = usuario.first_name;
        this.last_name = usuario.last_name;
        this.fullName = this.first_name+" "+this.last_name;
        this.email = usuario.email;
        this.age = usuario.age;
        this.cart = usuario.cart;
        this.rol = usuario.rol;
        this.documents = usuario.documents;
        this.last_connection = usuario.last_connection;
    }
}
