import express from 'express';
import healthCheck from './healthCheck.router';
import authRoutes from '../../Auth_Service/routers/auth.index.routes';
import clientRoutes from '../../Client_Service/routers/v1/client.index.routes';
const v1Router = express.Router();

v1Router.use('/health', healthCheck);
v1Router.use('/auth', authRoutes);
v1Router.use('/client', clientRoutes);



export default v1Router;