import mongoose from "mongoose";

const ticketsCollection = "tickets";
const ticketsEsquema = new mongoose.Schema(
    {
        code: String,
        purchase_datetime: Date,
        amount: Number,
        purchaser: String
    },
    {
        timestamps:true
    }
);

const ticketsModelo = mongoose.model(
    ticketsCollection,
    ticketsEsquema
);

export default ticketsModelo;
