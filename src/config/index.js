import mongoose from 'mongoose';

const connectToMongoDB = async () => {
  try {
    const connectionString = process.env.DB_HOST;

    await mongoose.connect(connectionString);

    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
  }
};

export { connectToMongoDB };
