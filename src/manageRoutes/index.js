import express from 'express';
import { authenticateJWT } from '../middlewares/index.js'
const manageRoutes = express.Router();
import { authRoutes, categoryRoutes, noAuthRoutes } from '../routes/index.js';

manageRoutes.use('/noAuth', noAuthRoutes);
manageRoutes.use('/category', categoryRoutes);
manageRoutes.use(authenticateJWT);
manageRoutes.use('/auth', authRoutes);

export { manageRoutes };
