const express = require('express');
const router = express.Router();
const { ensureAuthenticated, ensureSuperUser, authMiddleware } = require('../middlewares/auth');
const authorize = require('../middlewares/authorize');

router.get('/', ensureAuthenticated, ensureSuperUser, (req, res) => { 
    res.json({ message: 'Welcome to Admin Panel' });
});

router.get('/admin-user', authMiddleware, authorize('admin'), (req, res) => {
  res.status(200).json({ message: "Welcome, admin user!" });
});

module.exports = router;