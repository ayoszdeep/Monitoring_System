// controllers/healthCheck.controller.ts

import { Request, Response } from "express";
import ResponseFormatter from "../shared/utils/helpers/responseFormatter";

export const healthCheckController = (req: Request, res: Response) => {
    res.status(200).json(
        ResponseFormatter.success(
            {
                status: "healthy",
                timestamp: new Date().toISOString(),
                uptime: process.uptime(),
            },
            "Service is healthy"
        )
    );
};