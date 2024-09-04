import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const generateJwtToken = (data, options = {}) => {
  try {
    const plainData = JSON.parse(JSON.stringify(data));
    const token = jwt.sign(plainData, process.env.SECRET_KEY, options);
    return token;
  } catch (error) {
    console.error('Error generating JWT token:', error);
    throw new Error('Failed to generate JWT token');
  }
};

const verifyJwtToken = async (token) => {
  try {
    const decodedToken = jwt.verify(token, process.env.SECRET_KEY);
    return decodedToken;
  } catch (err) {
    throw new Error('Invalid token');
  }
};

const generateAuthToken = async (userData) => {
  try {
    const token = generateJwtToken(userData, {
      expiresIn: '1h',
    });

    return token;
  } catch (error) {
    console.error('Error generating auth token:', error);
    throw new Error('Failed to generate auth token');
  }
};
export { generateJwtToken, generateAuthToken, verifyJwtToken };
