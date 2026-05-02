import express from 'express';
import clientRoutes from './client.router';


const clientRouter = express.Router();

clientRouter.use('/', clientRoutes);

export default clientRouter;