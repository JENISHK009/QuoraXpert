import { handleError, handleResponse } from './reponse.js';
import {
  generateAuthToken,
  verifyJwtToken,
  generateJwtToken,
} from './jwtToken.js';
import sendEmail from './sendEmail.js';
import { replacePlaceholders } from './replacePlaceHolder.js';
import { generateOTP } from './generteOTP.js';

export {
  handleError,
  handleResponse,
  generateAuthToken,
  sendEmail,
  replacePlaceholders,
  verifyJwtToken,
  generateOTP,
  generateJwtToken,
};
