import bcrypt from 'bcrypt';
import { handleError, handleResponse } from '../utils/index.js';
import { userModel } from '../models/index.js';

const updatePassword = async (req, res) => {
  try {
    const userId = req.currentUser._id;
    const user = await userModel.findById(userId);

    if (!user) {
      throw new Error('User not found');
    }

    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      throw new Error('Please provide all password fields');
    }

    const passwordValidation =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (!passwordValidation.test(newPassword)) {
      throw new Error(
        'Password must be at least 8 characters long and contain at least one lowercase letter, one uppercase letter, one number, and one special character'
      );
    }

    if (newPassword !== confirmPassword) {
      throw new Error('New password and confirm password do not match');
    }

    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password
    );
    if (!isCurrentPasswordValid) {
      throw new Error('Current password is incorrect');
    }

    if (newPassword === currentPassword) {
      throw new Error(
        'New password cannot be the same as the current password'
      );
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedNewPassword;
    await user.save();

    handleResponse(res, 'Password updated successfully');
  } catch (error) {
    console.error('Error updating password:', error);
    handleError(res, error, 400, 'Error updating password');
  }
};

const updateProfile = async (req, res) => {
  try {
    const userId = req.currentUser._id;
    const user = await userModel
      .findById(userId)
      .select('_id name email isActive');

    if (!user) {
      throw new Error('User not found');
    }

    const name = req.body.name;

    if (!name) {
      throw new Error('Please provide a name');
    }

    user.name = name;
    await user.save();

    handleResponse(res, 'Profile updated successfully', user);
  } catch (error) {
    console.error('Error updating profile:', error);
    handleError(res, null, 400, 'Error updating profile');
  }
};

export default { updatePassword, updateProfile };
