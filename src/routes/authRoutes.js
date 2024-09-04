import express from 'express';
const router = express.Router();
import { authController } from '../controller/index.js';

router
  .put('/updatePassword', authController.updatePassword)
  .put('/updateProfile', authController.updateProfile);
export default router;
