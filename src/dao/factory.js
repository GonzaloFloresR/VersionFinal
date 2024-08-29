import config from "../config/config.js";

export let Contacts;

switch(config.PERSISTENCE){
    case "MONGO":
        const connection = "mongodb+srv://gonzalof:Coder098@cluster0.pt1wq7n.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
        const {defaul: ContactsMongo} = await import(`../dao/ProductsMongoDAO.js`)
    }