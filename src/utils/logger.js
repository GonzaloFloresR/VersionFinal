import winston, { format } from "winston";

const customLeves = {
    fatal:0,
    error:1,
    warning:2,
    info:3,
    http:4,
    debug:5
}

export const logger = winston.createLogger({
    levels:customLeves,
    transports:[
        new winston.transports.Console({    level:"debug",
                                            format: winston.format.combine(
                                                winston.format.timestamp(),
                                                winston.format.colorize({error:"bold blue whiteBG"}),
                                                winston.format.simple())
                                        }),
        new winston.transports.File({   level:"error",
                                        filename:`./errors.log`,
                                        format:format.combine(
                                            winston.format.timestamp(),
                                            winston.format.json()
                                        )})
    ]
});

export const addLogger = (req, res, next) => {
    req.logger =  logger;
    req.logger.http(`${req.method} en ${req.url} - ${new Date().toLocaleTimeString()}`);
    next();
}