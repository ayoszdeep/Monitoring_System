import express from "express";
import { healthCheckController } from "../../controllers/healthCheck.controller";


const router = express.Router();

router.get("/", healthCheckController);

export default router;