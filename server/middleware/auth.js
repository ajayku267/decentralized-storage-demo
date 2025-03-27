const jwt = require('jsonwebtoken');

/**
 * Middleware to authenticate API requests using JWT
 * For a production system, this should be enhanced with proper user management
 */
const auth = (req, res, next) => {
  // Get token from header
  const token = req.header('x-auth-token');

  // Check if no token
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    // Verify token
    const secret = process.env.JWT_SECRET || 'development_secret_change_in_production';
    const decoded = jwt.verify(token, secret);

    // Add user from payload
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

/**
 * Simplified API key authentication for provider services
 * In production, this should be replaced with a more secure system
 */
const apiKeyAuth = (req, res, next) => {
  const apiKey = req.header('x-api-key');
  const validApiKey = process.env.API_KEY || 'development_api_key_change_in_production';

  if (!apiKey || apiKey !== validApiKey) {
    return res.status(401).json({ message: 'Invalid or missing API key' });
  }

  next();
};

/**
 * For development and demo purposes - skips authentication
 * NEVER use in production unless explicitly needed for public endpoints
 */
const skipAuth = (req, res, next) => {
  console.warn('⚠️ Authentication bypassed - for development only');
  next();
};

module.exports = {
  auth,
  apiKeyAuth,
  skipAuth
}; 