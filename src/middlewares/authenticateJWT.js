import mongoose from 'mongoose';
import { userModel } from '../models/index.js';
import { handleError, verifyJwtToken } from '../utils/index.js';

const authenticateJWT = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    if (!authHeader) {
      throw new Error('Please provide a valid authorization token');
    }

    const token = authHeader.replace('Bearer ', '');
    if (!token) {
      throw new Error('Invalid token format');
    }

    const decodedToken = await verifyJwtToken(token);
    const userId = new mongoose.Types.ObjectId(decodedToken._id);

    const user = await userModel.findOne({ _id: userId }).populate('roleId');
    if (!user) {
      throw new Error('User not found. Please check your credentials');
    }
    if (!user.isVerified) {
      throw new Error('User not found');
    }
    if (!user.isActive) {
      throw new Error(
        'Your account is inactive. Please contact our administrator to reactivate your account'
      );
    }
    req.currentUser = user;
    next();
  } catch (error) {
    console.error('Error verifying JWT token:', error);
    handleError(res, null, 401, 'Invalid token or unauthorized access');
  }
};

export default authenticateJWT;
