import express from "express";
import ResponseFormatter from "../../shared/utils/helpers/responseFormatter";
const healthCheck = express.Router();

healthCheck.get('/', (req, res) => {
    res.status(200).json(
        ResponseFormatter.success(
            {
                status: 'healthy',
                timestamp: new Date().toISOString(),
                uptime: process.uptime(),
            },
            'Service is healthy'
        )
    );
});

export default healthCheck;