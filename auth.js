import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const SECRET_KEY = process.env.JWT_SECRET || 'securehealth_jwt_secret_2025';

export const verifyToken = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(403).json({ 
        success: false, 
        error: 'Access denied. Authentication required.',
        requiresAuth: true 
      });
    }
    
    // Verify token
    const decoded = jwt.verify(token, SECRET_KEY);
    
    // Check if token is expired
    if (decoded.exp && decoded.exp < Date.now() / 1000) {
      return res.status(401).json({ 
        success: false, 
        error: 'Session expired. Please login again.',
        requiresAuth: true 
      });
    }
    
    // Verify user still exists
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        error: 'User not found.',
        requiresAuth: true 
      });
    }
    
    // Attach user info to request
    req.userId = decoded.id;
    req.userEmail = decoded.email;
    req.userName = decoded.name;
    req.user = user;
    
    next();
  } catch (err) {
    console.error('Token verification error:', err.message);
    
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false, 
        error: 'Session expired. Please login again.',
        requiresAuth: true 
      });
    }
    
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid authentication token.',
        requiresAuth: true 
      });
    }
    
    return res.status(500).json({ 
      success: false, 
      error: 'Authentication failed.' 
    });
  }
};

// Optional: Rate limiting middleware
export const rateLimiter = (req, res, next) => {
  // Implement rate limiting logic here
  next();
};
