import { Router } from  "express";
const router = Router();

router.get("/", (req, res) => {
    req.logger.error("Prueba log error");
    
    req.logger.debug("Prueba log debug");

    res.setHeader("Content-Type","application/json");
    return res.status(200).json({succes:"Desde LoggerTest"});
});

export default router;