const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

const normalizeRole = (role) => String(role || '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '');

const authorize = (roles) => {
  return (req, res, next) => {
    const userRole = normalizeRole(req.user?.role);
    const allowedRoles = roles.map(normalizeRole);

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    next();
  };
};

module.exports = authenticate;
module.exports.authenticate = authenticate;
module.exports.authorize = authorize;
