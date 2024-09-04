const handleResponse = (res, message, data, statusCode = 200) => {
  res.status(statusCode).json({ success: true, message, data });
};

const handleError = (res, error, statusCode = 400, message) => {
  res.status(statusCode).json({
    success: false,
    message: error?.message || message || 'Internal server error',
  });
};

export { handleResponse, handleError };
