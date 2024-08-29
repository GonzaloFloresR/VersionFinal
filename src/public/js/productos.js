const comprar = async(pid) => {
    let inputCarrito = document.getElementById("carrito");
    let cid = inputCarrito.value;

    console.log(`Codigo Producto ${pid} / Código Carrito es ${cid}`);
    try {
        let respuesta = await fetch(`/api/carts/${cid}/products/${pid}`,{method:"put"});
        if(respuesta.status == 400){
            let datos = await respuesta.json();
            Swal.fire({
                icon: "error",
                title: "Oops...",
                text: datos.error,
            });
        }
        if(respuesta.status === 200){
        let datos = await respuesta.json();
        Swal.fire({
            position: "top-end",
            icon: "success",
            title: `Producto Agregado al carrito`,
            text: `Producto ${pid} agregado al carrito ${cid}`,
            showConfirmButton: false,
            timer: 3000
        });
        
        }
    } 
    catch(error){error.menssage} 
}
// ###################################################################
const eliminarProducto = async(pid, cid) => {
    console.log("Eliminar Producto: ",pid, "del Carrito :",cid);

    const producto = document.querySelector(`[data-product-id="${pid}"]`);
    const inputMostrarQuantity = producto.querySelector('input[name="MostrarQuantity"]');
    let cantidad = parseInt(inputMostrarQuantity.value);

    const respuesta = await Swal.fire({
        title: "¿Esta seguro?",
        text: "¿Desea eliminar el producto del carrito?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Si, eliminarlo"
    });
    let eliminado;
    if(respuesta.isConfirmed){
        try {
            eliminado = await fetch(`/api/carts/${cid}/products/${pid}`,{
                                                                            method:"DELETE",
                                                                            headers:{"Content-Type":"application/json"},
                                                                            body:JSON.stringify({cantidad})
                                                                        }
                                    ); //cerrando el fetch
        } catch(error){
            Swal.fire({
                title: error,
                text: "Problemas con el servidor",
                icon: "error"
            });
        }
    }
    if(eliminado){
        Swal.fire({
            title: "Eliminado!",
            text: "Producto Eliminado Correctamente",
            icon: "success"
        });
    }
}

const ticketCompra = async(carrito) => {
    let divCarrito = document.getElementById("carrito");
    let respuesta = await fetch(`/api/carts/${carrito}/purchase`);
    if(respuesta.ok){
        let compra = await respuesta.json();
        let mensaje = compra.message;
        let ticket = compra.succes;
        let productos = divCarrito.querySelectorAll(".itemCarrito");
        console.log(productos)
        productos.forEach(elemento => {
            elemento.remove();
        })
        Swal.fire({
            title: mensaje,
            html:`  <b>code:</b>${ticket.code}<br>
                    <b>Fecha de compra:</b>${ticket.purchase_datetime}<br>
                    <b>Email Comprador:</b>${ticket.purchaser}<br>
                    <b>Valor Total:</b>${ticket.amount}
                    `,
            showClass: {
                popup: `animate__animated
                        animate__fadeInUp
                        animate__faster`
            },
            hideClass: {
                popup: `animate__animated
                        animate__fadeOutDown
                        animate__faster`
            }
        });
    } else {
        let rechazo = await respuesta.json();
        let error = rechazo.error;
        Swal.fire({
            icon: "error",
            title: "Oops...",
            text: error
        });
    }
}

const modificar = async(pid, cid, funcion) => {
    const producto = document.querySelector(`[data-product-id="${pid}"]`);
    const inputMostrarQuantity = producto.querySelector('input[name="MostrarQuantity"]');
    let quantity = parseInt(inputMostrarQuantity.value);
    
    if(funcion == "agregar"){
        console.log("agregando")
        let cantidad = 1;
        let respuesta = await fetch(`/api/carts/${cid}/products/${pid}`,{
            method:"PUT",
            headers:{"Content-Type":"application/json"},
            body:JSON.stringify({cantidad})
        });
        if(respuesta.ok){
            let agregado =  await respuesta.json()
            inputMostrarQuantity.value = quantity + 1; 
            Swal.fire({
                position: "top-end",
                icon: "success",
                title: "Producto agregado",
                showConfirmButton: false,
                timer: 1500
            });
        } else { 
            let rechazado = await respuesta.json();
            Swal.fire({
                position: "top-end",
                icon: "error",
                title:"Error al agregar producto",
                text:rechazado.error,
                showConfirmButton: false,
                timer: 1500
            });
        }
    }
    else {
        console.log("quitando")
        let cantidad = -1;
        if(quantity == 1){
            const respuesta = await Swal.fire({
                title: "¿Esta seguro?",
                text: "¿Desea eliminar el producto del carrito?",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#3085d6",
                cancelButtonColor: "#d33",
                confirmButtonText: "Si, eliminarlo"
            });
            let eliminado;
            if(respuesta.isConfirmed){
                try {
                    let eliminado = await fetch(`/api/carts/${cid}/products/${pid}`,{method:"DELETE"});
                    if(eliminado.ok){
                        Swal.fire({
                            position: "top-end",
                            icon: "success",
                            title: "Producto eliminado",
                            showConfirmButton: false,
                            timer: 1500
                        });
                        producto.remove();
                    } 
                } catch(error){
                    let mensaje = await eliminado.json();
                    Swal.fire({
                        position: "top-end",
                        icon: "error",
                        title: "Error al eliminar",
                        text: mensaje.error,
                        showConfirmButton: false,
                        timer: 1500
                    });
                }
            }
        } else {
            let respuesta = await fetch(`/api/carts/${cid}/products/${pid}`,{
                method:"PUT",
                headers:{"Content-Type":"application/json"},
                body:JSON.stringify({cantidad})
            });
            if(respuesta.ok){
                let eliminado = await respuesta.json();
                inputMostrarQuantity.value = quantity - 1;
                Swal.fire({
                    position: "top-end",
                    icon: "success",
                    title: "Producto eliminado",
                    showConfirmButton: false,
                    timer: 1500
                });
            } else {
                    let Error = await respuesta.json();
                    Swal.fire({
                        position: "top-end",
                        icon: "error",
                        title: "Error al intentar eliminar",
                        text: Error.error,
                        showConfirmButton: false,
                        timer: 1500
                    });
            }
        }
        
    }
    
}




