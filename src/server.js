import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';

import { connectToMongoDB } from './config/index.js';
import { manageRoutes } from './manageRoutes/index.js';
const app = express();
dotenv.config();

async function startServer() {
  await connectToMongoDB();

  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(cors());

  app.use('/xpert', manageRoutes);


  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

startServer().catch((error) => {
  console.error('Error starting server:', error);
});
