// src/app.ts
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

import v1Router from './routers/v1/index.router';
import { errorHandler } from './shared/middleware/errorHandler';
import { attachCorrelationIdMiddleware } from './shared/middleware/correlationId.middleware';
import logger from './shared/loggers/logger';
import ResponseFormatter from './shared/utils/helpers/responseFormatter';

const app = express();

// Core middlewares
app.use(helmet());
app.use(cors({
    origin: true,
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Correlation ID
app.use(attachCorrelationIdMiddleware);

// Logging
app.use((req, res, next) => {
    logger.info(`${req.method} ${req.path}`, {
        ip: req.ip,
        userAgent: req.headers['user-agent']
    });
    next();
});

// Routes
app.use('/api/v1', v1Router);

// 404
app.use((req, res) => {
    res.status(404).json(
        ResponseFormatter.error("Endpoint not found", 404)
    );
});

// Global error handler
app.use(errorHandler);

export default app;