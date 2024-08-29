let logout = async(event) => {
    event.preventDefault();
    try {
        let respuesta = await fetch("/api/sessions/logout", {method: 'GET'});
            if (!respuesta.ok) {
                return console.log("Error al intentar hacer logOut");
            }
            let resultado = await respuesta.json();
            if(resultado.status === "success"){
                window.location.href = "/login";
            }
    
        } catch(error){
            console.error('Error al enviar la solicitud:', error.message);
        }
}