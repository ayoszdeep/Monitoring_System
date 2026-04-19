import express from 'express';
import healthCheck from './healthCheck.router';
const v1Router = express.Router();

v1Router.use('/health',healthCheck);




export default v1Router;