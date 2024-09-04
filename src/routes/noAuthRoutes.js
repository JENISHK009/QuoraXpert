import express from 'express';
const router = express.Router();
import { noAuthController } from '../controller/index.js';

router
  .post('/login', noAuthController.login)
  .post('/signup', noAuthController.signup)
  .post('/addProfile', noAuthController.addProfile)
  .post('/verifySignUpOtp', noAuthController.verifySignUpOtp)
  .put('/forgotPassword', noAuthController.forgotPassword)
  .put('/updatePassword', noAuthController.updatePassword)
  .post('/resendOtp', noAuthController.resendOtp);

export default router;
