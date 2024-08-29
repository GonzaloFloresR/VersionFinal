import { TicketsMongoDAO as DAO } from "../dao/TicketsMongoDAO.js"

class TicketsService {
    constructor(dao){
        this.TicketsDao = dao;
    }

    async getTickets(){
        return await this.TicketsDao.get();
    }

    async getTicketBy(filter){
        return await this.TicketsDao.getBy(filter);
    }

    async createNewTicket(NewTicket){
        return await this.TicketsDao.create(NewTicket);
    }
}

export const ticketsService = new TicketsService(new DAO());