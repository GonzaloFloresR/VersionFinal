import mongoose from "mongoose";
import paginate from "mongoose-paginate-v2";

const productCollection = "products";
const productosEsquema = new mongoose.Schema({
    title: String,
    description: String,
    price: Number,
    thumbnail: String,
    code: {type: String, unique: true, required:true},
    owner: {type: mongoose.Types.ObjectId, ref:"usuarios"},
    stock: {type: Number, default:0}
},{
    timestamps:true
});

productosEsquema.plugin(paginate);

const productoModelo = mongoose.model(
    productCollection,
    productosEsquema
);

export default productoModelo;