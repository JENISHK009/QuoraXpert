import express from 'express';
const router = express.Router();
import { categoryContoller } from '../controller/index.js';

router
  .get('/getCategories', categoryContoller.getCategories)
  .post('/addOrUpdateCategories', categoryContoller.addOrUpdateCategories);
export default router;
