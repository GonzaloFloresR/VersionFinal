import ticketsModelo from "./models/TicketModel.js";

export class TicketsMongoDAO {

    async get(){
        try {
            return await ticketsModelo.find().lean();
        }
        catch(error){
            console.log(error.message);
        }
    }

    async getBy(filtro={}){
        try {
            return await ticketsModelo.findOne(filtro).lean();
        }
        catch(error){
            console.log(error.message);
        }
    }

    async create(ticket){
        try {
            let nuevoTicket =  await ticketsModelo.create(ticket);
            return nuevoTicket.toJSON();
        }
        catch(error){
            console.log(error.message);
        }
    }
}

