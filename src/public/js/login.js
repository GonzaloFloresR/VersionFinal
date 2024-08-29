let login = async (event) => {
    let usuario = document.getElementById("usuario").value;
    let password = document.getElementById("password").value;
    event.preventDefault();
    try {
        let respuesta = await fetch("/api/sessions/login", {
            method: 'POST',
            headers: {
                'Content-Type':'application/json'
            },
            body: JSON.stringify({usuario, password})
        });
        if (!respuesta.ok) {
            let h2Error = document.getElementById("MensajeError");
            h2Error.textContent = "Usuario y/o Password no coinciden con nuestros registros, vuelva a intentarlo";
            h2Error.setAttribute('style', 'color: red; font-weight: bold; background:black');
        }
        let resultado = await respuesta.json();
        if(resultado.status === "success"){
            window.location.href = "/products";
        }

    } catch(error){
        console.error('Error al enviar la solicitud:', error.message);
    }
    
}
