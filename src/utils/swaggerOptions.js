import swaggerJSDoc from "swagger-jsdoc";

const swaggerOptions = {
    definition:{
        openapi:'3.0.0',
        info:{
            title:'Documentación de Lista del Sol',
            description:'E-Commerce'
        }
    },
    apis:['./src/docs/**/*.yaml']
}

const specs = swaggerJSDoc(swaggerOptions);

export default specs;
