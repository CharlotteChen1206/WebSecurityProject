const express = require('express');
const passport = require('passport');
const router = express.Router();

// 渲染登录页面
router.get('/login', (req, res) => {
    res.render('pages/login', {
        title: 'Log In',
        csrfToken: res.locals.csrfToken
    });
});

// 渲染注册页面
router.get('/signup', (req, res) => {
    res.render('pages/signup', {
        title: 'Sign Up',
        csrfToken: res.locals.csrfToken
    });
});

module.exports = router;