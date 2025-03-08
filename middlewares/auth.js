const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: "No token, authorization denied" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: "Token is not valid" });
  }
};

const ensureAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {  // Google OAuth 使用 `req.isAuthenticated()`
    return next();
  }

  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: "No token, authorization denied" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: "Token is not valid" });
  }
};

const ensureSuperUser = (req, res, next) => {
  if (req.isAuthenticated() && req.user.role === 'superuser') {
    return next();
  }
  if (req.user?.role === 'superuser') {
    return next();
  }
  res.status(403).json({ message: "Access denied: Super Users only." });
};

module.exports = {
  authMiddleware,
  ensureAuthenticated,
  ensureSuperUser,
};