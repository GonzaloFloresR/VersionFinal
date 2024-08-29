import multer from "multer";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";
import {fileURLToPath} from 'url';
import { dirname } from 'path';
import config from "./config/config.js";

const __filename = fileURLToPath(import.meta.url);
export const __dirname = dirname(__filename);

const storageProducts = multer.diskStorage({
    destination:(request, file, cb) => {
        cb(null, __dirname+'/public/img/products');
    },
    filename:(request, file, cb) => {
        cb(null, file.originalname);
    }
});

const storageProfiles = multer.diskStorage({
    destination:(request, file, cb) => {
        cb(null, __dirname+'/public/img/profiles');
    },
    filename:(request, file, cb) => {
        cb(null, file.originalname);
    }
});

const storageDocuments = multer.diskStorage({
    destination:(request, file, cb) => {
        cb(null, __dirname+'/public/documents');
    },
    filename:(request, file, cb) => {
        cb(null, file.originalname);
    }
});


export const generaHash = password => bcrypt.hashSync(password, bcrypt.genSaltSync(10));
export const validaPassword = (password, passwordHash) => bcrypt.compareSync(password, passwordHash);

export const uploader = multer({storage: storageProducts});
export const uploaderProfiles = multer({storage: storageProfiles});
export const uploaderDocuments = multer({storage: storageDocuments});

export const formatearMoneda = (valor) => {
    const opciones = {
        style: 'currency',
        currency: 'CLP',
        minimumFractionDigits: 0, // Opcional: para evitar decimales
    };
    const formatoMoneda = new Intl.NumberFormat('es-CL', opciones);
    return formatoMoneda.format(valor);
}

export const transporter = nodemailer.createTransport({
    service:`gmail`,
    port:587,
    auth:{
        user:`gonzalofloresr@gmail.com`,
        pass: config.GMAIL_PASS
    }
});

export const enviarMail = async(to, subject, message, attachments) => {
        return await transporter.sendMail({
            from:`Lista del Sol <gonzalofloresr@gmail.com>`,
            to: to,
            subject: subject,
            //text:`Mensaje en texto plano`,
            html: message,
            attachments: attachments
        });
}



