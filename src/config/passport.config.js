import passport from "passport";
import local from "passport-local";
import GitHub from "passport-github2";
import { cartsService } from "../repository/cartsService.js"
import UsersDAO from "../dao/UsersMongoDAO.js";
import {generaHash, validaPassword} from "../utils.js"; 
import config from "../config/config.js"

const usersDAO = new UsersDAO();

const initPassport = () => {
    
    passport.use(
        "github",
        new GitHub.Strategy(
            {
                clientID: config.GITHUB_CLIENT_ID,
                clientSecret: config.GITHUB_CLIENT_SECRET,
                callbackURL:"http://localhost:8080/api/sessions/callbackGithub"
            },
            async(tokenAcceso, tokenRefresh, profile, done) => {
                try { 
                    
                    let email = profile._json.email;
                    let nombre = profile._json.name;
                    if(!email){
                        return done(null, false); //decia nullm modificado 22 agosto
                    }
                    let usuario = await usersDAO.getUsuarioBy({email});
                    if(!usuario){
                        let cart = await cartsService.createNewCart();
                        usuario = await usersDAO.createUsuario({
                            first_name:nombre, email, cart, profile
                        });
                    }
                    return done(null, usuario);

                } 
                catch(error){
                    return done(error);
                }
            }
        )
    );

    passport.use(
        "registro",
        new local.Strategy(
            {
                usernameField:"email",
                passReqToCallback: true
            },
            async(req, username, password, done) => {
                try { 
                    
                    let {nombre:first_name, apellido:last_name, edad:age, rol} = req.body;
                    if(!first_name){
                        return done(null, false);
                    }
                    
                    let emailCheck = await usersDAO.getUsuarioBy({email: username});
                    if(emailCheck){
                        return done(null, false);
                    }
                    
                    let cart = await cartsService.createNewCart();
                    password = generaHash(password);
                    let usuario = {first_name,last_name,age, email:username, password, rol, cart};
                    let nuevoUsuario = await usersDAO.createUsuario(usuario);
                    if(nuevoUsuario){
                        nuevoUsuario = {...nuevoUsuario}
                        delete nuevoUsuario.password;
                        return done(null, nuevoUsuario);
                    }
                    
                } 
                catch(error){
                    return done(error);
                }
            }
        )
    );

    passport.use(
        "login",
        new local.Strategy(
            {
                usernameField:"usuario"
            },
            async(username, password, done) => {
                try { 
                        let existeUsuario = await usersDAO.getUsuarioBy({"email":username});
                        if (!existeUsuario){
                            return done(null, false);
                        } else {
                            if(!validaPassword(password, existeUsuario.password)){
                                return done(null, false);
                            }
                            return done(null, existeUsuario);
                        }
                        
                    } 
                    catch(error){
                        return done(error);
                    }
            })
    );

    passport.serializeUser((usuario, done) => {
        return done(null, usuario._id)
    });

    passport.deserializeUser(async(id,done) => {
        let usuario = await usersDAO.getUsuarioBy({_id:id});
        return done(null, usuario)
    });
}

export default initPassport;