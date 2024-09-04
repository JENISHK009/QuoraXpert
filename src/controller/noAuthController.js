import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import { userModel, roleModel } from '../models/index.js';
import {
  handleResponse,
  handleError,
  generateAuthToken,
  generateJwtToken,
  replacePlaceholders,
  sendEmail,
  verifyJwtToken,
  generateOTP,
} from '../utils/index.js';

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
      throw new Error('Invalid email format');
    }

    if (password.length < 8) {
      throw new Error('Password must be at least 8 characters');
    }

    const user = await userModel.aggregate([
      {
        $match: {
          email,
        },
      },
      {
        $lookup: {
          from: 'roles',
          localField: 'roleId',
          foreignField: '_id',
          as: 'role',
        },
      },
      {
        $unwind: '$role',
      },
      {
        $project: {
          _id: 1,
          roleId: 1,
          password: 1,
          roleName: '$role.name',
        },
      },
    ]);

    const userData = user[0];

    if (!userData) {
      throw new Error('User not found');
    }

    const isValid = await bcrypt.compare(password, userData.password);
    if (!isValid) {
      throw new Error('Invalid password');
    }

    const token = await generateAuthToken(userData);
    handleResponse(res, 'Logged in successfully', { token });
  } catch (error) {
    handleError(res, error);
  }
};

const signup = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      throw new Error('Email is required.');
    }

    if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
      throw new Error(
        'Invalid email format. Please enter a valid email address.'
      );
    }

    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      if (existingUser.isVerified) {
        throw new Error('This email is already registered. Please log in.');
      } else {
        const token = await generateAuthToken(existingUser);
        return handleResponse(
          res,
          'User found but not verified. Please complete your profile.',
          {
            addProfile: true,
            token,
          }
        );
      }
    }

    const user = new userModel({
      email,
      isVerified: false,
    });

    await user.save();

    const token = await generateAuthToken(user);
    handleResponse(
      res,
      'User created successfully. Please complete your profile.',
      {
        token,
      }
    );
  } catch (error) {
    console.error('Error during signup:', error);
    handleError(res, error, 400, 'Error during signup. Please try again.');
  }
};

const addProfile = async (req, res) => {
  try {
    const {
      name,
      token,
      gender,
      roleId,
      referralCode,
      categoryIds,
      subcategoryIds,
      nestedCategoryIds,
      password,
      confirmPassword,
    } = req.body;

    const missingFields = [];
    if (!name) missingFields.push('name');
    if (!token) missingFields.push('token');
    if (!gender) missingFields.push('gender');
    if (!roleId) missingFields.push('roleId');
    if (!categoryIds) missingFields.push('categoryIds');
    if (!subcategoryIds) missingFields.push('subcategoryIds');
    if (!nestedCategoryIds) missingFields.push('nestedCategoryIds');
    if (password || confirmPassword) {
      if (!password) missingFields.push('password');
      if (!confirmPassword) missingFields.push('confirmPassword');
    }

    if (missingFields.length > 0) {
      const errorMessage = `Please provide the following fields: ${missingFields.join(
        ', '
      )}.`;
      throw new Error(errorMessage);
    }

    if (password && confirmPassword) {
      if (password !== confirmPassword) {
        throw new Error(
          'Passwords do not match. Please re-enter them correctly.'
        );
      }

      const passwordValidation =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      if (!passwordValidation.test(password)) {
        throw new Error(
          'Your password must be at least 8 characters long and include at least one lowercase letter, one uppercase letter, one number, and one special character.'
        );
      }

      var hashedPassword = await bcrypt.hash(password, 10);
    }

    const decodedToken = await verifyJwtToken(token);
    const userId = new mongoose.Types.ObjectId(decodedToken._id);

    // Fetch user and role data in parallel
    const [user, roleData] = await Promise.all([
      userModel.findById(userId),
      roleModel.findById(roleId),
    ]);

    if (!user)
      throw new Error('User not found. Please make sure you are logged in.');
    if (!roleData) throw new Error('Invalid role. Please select a valid role.');

    // Validate category inputs with user-friendly messages
    if (Array.isArray(categoryIds) && categoryIds.length === 0)
      throw new Error('Please select at least one category.');
    if (Array.isArray(subcategoryIds) && subcategoryIds.length === 0)
      throw new Error('Please select at least one subcategory.');
    if (Array.isArray(nestedCategoryIds) && nestedCategoryIds.length === 0)
      throw new Error('Please select at least one nested category.');

    const otp = generateOTP();

    user.name = name;
    user.gender = gender;
    user.roleId = roleId;
    user.referralCode = referralCode;
    user.categoryIds = categoryIds || user.categoryIds;
    user.subcategoryIds = subcategoryIds || user.subcategoryIds;
    user.nestedCategoryIds = nestedCategoryIds || user.nestedCategoryIds;
    if (hashedPassword) user.password = hashedPassword;

    user.otp = otp;

    await user.save();

    const templatePath = 'src/emailTemplates/otpSend.html';
    const emailBody = replacePlaceholders(templatePath, { OTP: otp.code });
    sendEmail(user.email, 'Verify Your Account', emailBody);

    // Generate authentication token
    const authToken = await generateAuthToken(user);

    handleResponse(
      res,
      'Profile updated successfully! An OTP has been sent to your email address for verification.',
      {
        token: authToken,
      }
    );
  } catch (error) {
    console.error('Error updating profile:', error);
    handleError(
      res,
      error,
      400,
      'There was an issue updating your profile. Please try again.'
    );
  }
};

const verifySignUpOtp = async (req, res) => {
  try {
    const { token, otp } = req.body;

    if (!token || !otp) {
      throw new Error('Token and OTP are required');
    }

    const decodedToken = await verifyJwtToken(token);
    const userId = new mongoose.Types.ObjectId(decodedToken._id);
    const user = await userModel.aggregate([
      {
        $match: {
          _id: userId,
        },
      },
      {
        $lookup: {
          from: 'roles',
          localField: 'roleId',
          foreignField: '_id',
          as: 'role',
        },
      },
      {
        $unwind: '$role',
      },
      {
        $project: {
          _id: 1,
          roleId: 1,
          otp: 1,
          roleName: '$role.name',
        },
      },
    ]);
    const userData = user[0];
    if (!userData) {
      throw new Error('User not found');
    }

    if (userData?.otp?.code != otp) {
      throw new Error('Invalid OTP');
    }

    if (userData.otp.expiredAt < Date.now()) {
      throw new Error('OTP has expired');
    }

    await userModel.findByIdAndUpdate(userData._id, { isVerified: true });

    const authToken = await generateAuthToken(userData);
    handleResponse(res, 'OTP verified successfully', { authToken });
  } catch (error) {
    console.log(error);
    handleError(res, error);
  }
};

const forgotPassword = async (req, res) => {
  try {
    const email = req.body.email;

    if (!email) {
      throw new Error('Please provide an email');
    }

    const user = await userModel.findOne({ email });

    if (!user) {
      throw new Error('User not found');
    }

    const otp = generateOTP();
    user.otp = {
      code: otp.code,
      expiredAt: Date.now() + 60000,
    };
    await user.save();

    const templatePath = 'src/emailTemplates/otpSend.html';
    const emailBody = replacePlaceholders(templatePath, { OTP: otp.code });

    sendEmail(email, 'Forgot Password OTP', emailBody);

    const token = generateJwtToken({ _id: user._id });
    handleResponse(res, 'OTP sent successfully', { token });
  } catch (error) {
    console.error('Error sending OTP:', error);
    handleError(res, error, 400, 'Error sending OTP');
  }
};

const updatePassword = async (req, res) => {
  try {
    const token = req.body.token;
    const otp = req.body.otp;
    const password = req.body.password;

    if (!token || !otp || !password) {
      throw new Error('Please provide all required fields');
    }

    const { _id } = await verifyJwtToken(token);

    const user = await userModel.findById(_id);
    if (!user) {
      throw new Error('User not found');
    }

    const passwordValidation =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (!passwordValidation.test(password)) {
      throw new Error(
        'Password must be at least 8 characters long and contain at least one lowercase letter, one uppercase letter, one number, and one special character'
      );
    }

    if (user.otp.code !== otp || user.otp.expiredAt < Date.now()) {
      throw new Error('Invalid OTP or OTP has expired');
    }

    user.password = password;
    user.otp = {};
    await user.save();

    handleResponse(res, 'Password updated successfully');
  } catch (error) {
    console.error('Error updating password:', error);
    handleError(res, error, 400, 'Error updating password');
  }
};

const resendOtp = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      throw new Error('Token is required');
    }

    const decodedToken = await verifyJwtToken(token);
    const userId = new mongoose.Types.ObjectId(decodedToken._id);

    const user = await userModel.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const otp = generateOTP();
    user.otp = {
      code: otp.code,
      expiredAt: Date.now() + 60000,
    };

    await user.save();

    const templatePath = 'src/emailTemplates/otpSend.html';
    const emailBody = replacePlaceholders(templatePath, { OTP: otp.code });

    sendEmail(user.email, 'Resend OTP for Account Verification', emailBody);

    handleResponse(res, 'OTP resent successfully. Please check your email.', {
      token,
    });
  } catch (error) {
    console.error('Error resending OTP:', error);
    handleError(res, error, 400, 'Error resending OTP. Please try again.');
  }
};

export default {
  login,
  signup,
  verifySignUpOtp,
  forgotPassword,
  updatePassword,
  addProfile,
  resendOtp,
};
