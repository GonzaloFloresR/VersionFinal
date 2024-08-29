import mongoose from "mongoose";

const messagesCollection = "messages";
const messageEsquema = new mongoose.Schema({
    user: String,
    message: String,
},{
    timestamps:true
});

const mensajesModelo = mongoose.model(
    messagesCollection,
    messageEsquema
);


export default mensajesModelo;