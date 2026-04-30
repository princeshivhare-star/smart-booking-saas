const jwt = require('jsonwebtoken');
const User = require('../models/User.model');

const authenticate = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (!token) {
      return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).populate('businessId', 'name slug isActive');

    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, message: 'Invalid token or user deactivated.' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Token is invalid or expired.' });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role '${req.user.role}' is not authorized to access this resource.`,
      });
    }
    next();
  };
};

const belongsToBusiness = (req, res, next) => {
  const businessId = req.params.businessId || req.body.businessId || req.query.businessId;
  if (req.user.role === 'admin' && req.user.businessId?.toString() !== businessId) {
    return res.status(403).json({ success: false, message: 'Access denied to this business.' });
  }
  next();
};

module.exports = { authenticate, authorize, belongsToBusiness };
