export const generateOTP = () => {
  const otp = {
    code: Math.floor(100000 + Math.random() * 900000),
    expiredAt: Date.now() + 60000,
  };
  return otp;
};
