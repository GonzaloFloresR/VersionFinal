import fs from "fs";

export default class ProductsFileSystemDAO {
    #products;
    #path;

    constructor(){
        this.#path = "../../data/productos.json";
        this.inicializar();
    }

    async inicializar(){
        this.#products = await this.#Leer();
    }

    #asignarIdProducto(){
        let id = 1;
        if(this.#products.length != 0 ){
            id = this.#products[this.#products.length - 1].id + 1;
        }
        return id;
    }


    #Leer = async() => { 
        try {
                if(fs.existsSync(this.#path)){
                    return this.#products = JSON.parse( await fs.promises.readFile(this.#path, "utf-8"));
                } else {
                    return [];
                }
        } catch(error){
            console.log("Problemas al acceder al archivo ", error);
        }
    }

    #Escribir = async() => { 
        try {
            await fs.promises.writeFile(this.#path, JSON.stringify(this.#products, null, 5)); 
        } 
        catch(error){
            console.log("Problemas al acceder al archivo ", error);
        }
    }

    get(){
        return this.#products; //Devolver todos los productos
    }

    getBy(id){
        let producto = this.#products.find((prod)=>prod.id === id);
        return producto? producto : false; //`🛑 Product ID: ${id} Not Found 🛑`
    } 

    async add(producto){ 
        let {title, description, price, thumbnail, code, stock} = producto;

        if(!title || !description || !price || !code || !stock){

            return `Se require completar todos los parametros: title, description, price, thumbnail, code, stock`;

        } else {

            let repetido = this.#products.some( pro => pro.code === code.trim());

            if(repetido){

                return false;

            } else {
                
                if (thumbnail) {thumbnail = thumbnail.replace("/Applications/MAMP/htdocs/ClaseBackend/Desafio5/src/public", "..")}  

                const nuevoProducto = {
                        id: this.#asignarIdProducto(),
                        title:title,
                        description:description,
                        price:price,
                        thumbnail:thumbnail || "../img/SinImagen.png",
                        code:code,
                        stock:stock
                    };
                
                this.#products.push(nuevoProducto);
                try {
                    await this.#Escribir();
                return true;//`✅ Product added successfully ✅`
                }
                catch(error){
                    console.log(error);
                }
                
            }
        }
    }

    async update(id, Update){
        const index = this.#products.findIndex((produc) => produc.id === id );
        if(index >= 0){
            const {id, ...rest} = Update;
            this.#products[index] = {...this.#products[index], ...rest};
            try {
                await this.#Escribir(); 
                return `Archivo Actualizado`;
            }
            catch(error){
                console.log(error.message);
            }
            
        }else{
            return `El producto con el id: ${id} no existe`;
        }
    }

    async delete(pid){
        const index = this.#products.findIndex((produc) => produc.id === pid );
        if(index >= 0 ){
            this.#products =  this.#products.filter(produc => produc.id !== pid);
            try {
                await this.#Escribir();
                return true; //`Producto Eliminado Correctamente ✅`
            }
            catch(error){
                return false; //"Error al elinminar el producto";
            }
            
        } else {
            return false; //`🛑 El producto con el Id ${id} no existe`
        }
    }

}
