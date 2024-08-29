import mongoose, { isValidObjectId } from "mongoose";
import {afterEach, before, describe, it, beforeEach} from "mocha";
import supertest from "supertest-session";
import {expect} from "chai";
import fs from "fs";
import { __dirname } from "../../src/utils.js";


const connDB = async() => {
    try {
        await mongoose.connect(
            "mongodb+srv://gonzalof:Coder098@cluster0.pt1wq7n.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0",
        {
            dbName: "ecommerce"
        }
        );
        console.log("DB conectada...!!!");
    } catch (error) {
        console.log(`Error al conectar a DB: ${error}`);
    }
}

connDB();

const requester =  supertest("http://localhost:8080");

describe("Pruebas Proyecto ECommerce", function(){
    this.timeout(10000);

    describe("Pruebas Router de Products", function(){
        let IDProducto; 

        before(async function(){
            this.timeout(10000);
                let {body} =  await requester.post("/api/sessions/login")
                                            .send({"usuario":"gonzalof@hotmail.com","password":"1234"});
                console.log("Usuario Conectado!!!")
        });

        after(async function(){
            this.timeout(10000);
            //await mongoose.connection.collection("products").deleteMany({code:"FriedCakes"});
            fs.unlinkSync(`${__dirname}/public/img/TortaFritas.jpeg`);
        })

        it("Producto Router Products en su método GET devuelve un Array de Productos", async function(){
            let {body, status, ok, headers } =  await requester.get("/api/products/");
            if(status == 200 && ok === true){
                expect(Array.isArray(body)).to.be.true;
                expect(body.length).to.be.equal(10);
                if(Array.isArray(body) && body.length>0){
                    expect(body[0]._id).to.exist;
                    expect(body[0].title).to.exist;
                }
            }
        });

        it("El Router Products en su método GET:PID devuelve un Objeto de Producto", async function(){
            this.timeout(30000);
            let productoTest = await mongoose.connection.collection("products").findOne({title:"Semáforo"});
            if(isValidObjectId(productoTest._id)){
                let pid = productoTest._id;
                let {body, status, ok } =  await requester.get(`/api/products/${pid}`);
                if(status == 200 && ok === true){
                    expect(typeof body === "object").to.be.true;
                    expect(isValidObjectId(body._id)).to.be.true;
                    expect(body.title).to.exist;
                }
            }
        });
        
        it("El Router Products en su método POST crea un Producto con Imagen", async function(){
            this.timeout(10000);
            let mockProducts = {
                title: "Tortas Fritas",
                description: "Las Mejores Tortas Fritas de Argentina",
                price: 2500,
                thumbnail: "./test/routes/TortaFritas.jpeg",
                code: "FriedCakes",
                stock: 20,
            }
            let {body,ok} = await requester.post("/api/products/")
                                                    .field("title", mockProducts.title)
                                                    .field("description", mockProducts.description)
                                                    .field("price", mockProducts.price)
                                                    .field("code", mockProducts.code)
                                                    .field("stock", mockProducts.stock)
                                                    .attach("thumbnail",mockProducts.thumbnail)
            expect(ok).to.be.true;
            expect(body.payload).to.exist;
            expect(fs.existsSync(`${__dirname}/public/img/TortaFritas.jpeg`)).to.be.true
            expect(body.payload._id).to.exist;
            expect(body.payload.title).to.be.equal("Tortas Fritas");
            IDProducto = body.payload._id;
        });

        it(`El Router Products en su método PUT, modifica un producto PID`, async function(){
            this.timeout(10000);
            let mockProduct = {
                "title": "Ricas Fried Cakes",
                "description": "Las Mejores Tortas Fritas",
                "price": 2500,
                "stock": 10
            }
            let {body, ok} = await requester.put(`/api/products/${IDProducto}`)
                                            .send(mockProduct); 
            expect(ok).to.be.true;
            expect(body.modificado).to.exist;
            expect(body.modificado.title).to.be.equal("Ricas Fried Cakes");
            expect(body.modificado._id).to.be.equal(IDProducto);
            IDProducto = body.modificado;
        });

        it(`El Router Products en su método DELETE, Elimina un producto PID`, async function(){
            this.timeout(10000);
            let {body, ok} = await requester.delete(`/api/products/${IDProducto._id}`);
            let busqueda = await mongoose.connection.collection("products").findOne({title: IDProducto.title});
            expect(ok).to.be.true;
            expect(body.status).to.be.equal("succes")
            expect(busqueda).to.be.equal(null);
        });
    });// Cerrando Prueba Productos

    describe("Pruebas Router de Carts", function(){

        it("El Router Carts en su método GET devuelve un array de Carritos",async function(){
            this.timeout(10000);
            let {body, ok} = await requester.get("/api/carts/");
            expect(ok).to.be.true;
            expect(Array.isArray(body)).to.be.true;
            if(Array.isArray(body) && body.length>0){
                expect(body[0]._id).to.exist;
                expect(body[0].products).to.exist;
                expect(Array.isArray(body[0].products)).to.be.true;
            }
        });

        it("El Router Carts en su método GET:CID devuelve un array con un Carrito CID",async function(){
            this.timeout(10000);
            let cartTest = await mongoose.connection.collection("carts").findOne();
            let cid = cartTest._id;
            let {body, ok} = await requester.get(`/api/carts/${cid}`);
            expect(ok).to.be.true;
            expect(Array.isArray(body)).to.be.true;
            if(Array.isArray(body) && body.length>0){
                expect(body[0].productId).to.exist;
                expect(body[0].quantity).to.exist;
                expect(isValidObjectId(body[0]._id)).to.be.true;
            }
        });
        let carrito;
        it("El Router Carts en su método POST Crea un Carrito",async function(){
            this.timeout(10000);
            let productMock = await mongoose.connection.collection("products").findOne();
            let products = [
                {   "productId":productMock._id,
                    "quantity": 1 
                }
            ];
            let {body, ok} = await requester.post(`/api/carts/`)
                                            .send({products});
            carrito = {...body};
            expect(ok).to.be.true;
            expect(typeof body).to.be.equal("object");
            
            if(Array.isArray(body.products) && body.products.length>0){
                expect(body.products[0].productId).to.exist;
                expect(body.products[0].quantity).to.exist;
                expect(isValidObjectId(body.products[0]._id)).to.be.true;
            }
        });

        it("El Router Carts en su método GET/:cid/purchase devuelve un objeto purchase",async function(){
            this.timeout(10000);
            let cid = carrito._id;
            let {body, ok} = await requester.get(`/api/carts/${cid}/purchase`);
            expect(ok).to.be.true;
            expect(typeof body).to.be.equal("object");
            expect(body.succes).to.exist;
            expect(body.succes.code).to.exist;
            expect(isValidObjectId(body.succes._id)).to.be.true;
            expect(body.message).to.be.equal("Muchas gracias por su compra ✅");
            
        });

        it("El Router Carts en su método PUT/:CID/ Modifica un carrito CID",async function(){
            this.timeout(10000);
            let cid = carrito._id;
            let products = [carrito.products[0]];
            let carros = await mongoose.connection.collection("carts").findOne({_id: new mongoose.Types.ObjectId(cid)});
            let { body, ok } = await requester.put(`/api/carts/${cid}`)
                                                .send(products)
            expect(ok).to.be.true;
            expect(typeof body).to.be.equal("object");
            expect(body.status).to.exist;
            expect(body.status).to.be.equal("Productos Agregados");
        });

        it("El Router Carts en su método PUT/:cid/products/:pid Modifica un producto PID de un carrito CID", async function(){
            this.timeout(10000);
            let cid = carrito._id;
            
            let pid = "66a6d083bcf83d8b420f882c"; //Coca-Cola
            let { body, ok } = await requester.put(`/api/carts/${cid}/products/${pid}`)
                                                .send({"cantidad":1})
            expect(ok).to.be.true;
            expect(typeof body).to.be.equal("object");
            expect(body.succes).to.exist;
        });

        it("El Router Carts en su método delete/:cid/products/:pid Elimina un producto PID de un Carrito CID",async function(){
            this.timeout(10000);
            let cid = carrito._id;
            let pid = "66a6d083bcf83d8b420f882c"; //Coca-Cola
            let { body, ok } = await requester.delete(`/api/carts/${cid}/products/${pid}`);
            expect(ok).to.be.true;
            expect(typeof body).to.be.equal("object");
            expect(body.succes).to.exist;
            expect(typeof body.succes).to.be.equal("string");
        });

        it("El Router Carts en su método delete/:cid elimina un carrito especificado por CID", async function(){
            this.timeout(10000);
            let cid = carrito._id;
            let { body, ok } = await requester.delete(`/api/carts/${cid}`);
            expect(ok).to.be.true;
            expect(typeof body).to.be.equal("object");
            expect(body.status).to.equal("succes");
            expect(body.Eliminado).to.exist;
        });

    });// Cerrando Prueba Carts

    describe("Pruebas Router de Session", function(){

        it("El Router Sessions en su método POST/login ", async function(){
            let { body, ok } = await requester.post(`/api/sessions/login`)
                                            .send({usuario:"gonzalof@hotmail.com",password:"1234"}); 
            expect(ok).to.be.true;
            expect(body.status).to.be.equal("success");
            expect(body.data.first_name).to.exist;
        });

        it("El Router Sessions en su método GET/Current ", async function(){
            let { body, ok } = await requester.get(`/api/sessions/current`) 
            expect(ok).to.be.true;
            expect(typeof body.usuario).to.be.equal("object");
            expect(body.usuario._id).to.exist;
            expect(isValidObjectId(body.usuario._id)).to.be.true;
        });

        it("El Router Sessions en su método GET/logout ", async function(){
            let { body, ok } = await requester.get(`/api/sessions/logout`) 
            expect(ok).to.be.true;
            expect(body.status).to.be.equal("success");
            expect(body.message).to.be.equal("Usuario deslogueado");
        });

    }); // Cerrando Prueba Router Session


}) // Cerrando Prueba General 