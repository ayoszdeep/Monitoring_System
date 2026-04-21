import express from 'express';
import healthCheck from './healthCheck.router';
import authRoutes from '../../Auth_Service/routers/auth.index.routes';
const v1Router = express.Router();

v1Router.use('/health', healthCheck);
v1Router.use('/auth', authRoutes);




export default v1Router;