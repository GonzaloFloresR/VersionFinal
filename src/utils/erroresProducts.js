import os from "os";

export function argumentosProducts(products){
    let { title, price, ...otros} = products;
    return `Se han detectado argumentos inválidos:
    Argumentos obligatorios:
        - title: tipo String. Se recibio: ${title}
        - price: tipo Number. Se recibio:${price}
    Argumentos opcionales:
        -description, , code, stock. Se recibio: ${JSON.stringify(otros)}
    
    Fecha: ${new Date().toUTCString()}
    Usuario: ${os.userInfo().username}
    Terminal: ${os.hostname()}`
}