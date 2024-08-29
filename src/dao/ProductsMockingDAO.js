import {fakerES_MX as faker} from "@faker-js/faker";

export class ProductMockingDAO {

    get(){
        let _id = faker.database.mongodbObjectId();
        let title = faker.commerce.productName();
        let description = faker.commerce.productDescription();
        let price = faker.commerce.price();
        let thumbnail = faker.image.urlPicsumPhotos();
        let code = faker.internet.password();
        let stock = faker.number.int({min:1, max:200});
        return {
            _id,
            title,
            description,
            price,
            thumbnail,
            code,
            stock,
        }

    }


}//Cerrando Class