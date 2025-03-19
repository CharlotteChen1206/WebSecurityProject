require('dotenv').config();
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');
const fs = require('fs');
const path = require('path');

// 序列化用戶 - 只保存用戶ID到會話中
passport.serializeUser((user, done) => {
    console.log("序列化用戶:", user.id || user._id);
    done(null, user.id || user._id);
  });
  
  // 反序列化用戶 - 從資料庫獲取完整用戶資訊
  passport.deserializeUser(async (id, done) => {
    try {
      console.log("嘗試反序列化用戶ID:", id);
      const user = await User.findById(id);
      
      if (!user) {
        console.error("在反序列化中找不到用戶, ID:", id);
        return done(null, false);
      }
      
      console.log("成功反序列化用戶:", user.username);
      done(null, user);
    } catch (error) {
      console.error("反序列化用戶錯誤:", error);
      done(error, null);
    }
  });

// Google 策略配置
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_REDIRECT_URI,
}, async (accessToken, refreshToken, profile, done) => {
  try {
    console.log("Google OAuth callback triggered, profile ID:", profile.id);

    let user = await User.findOne({ googleId: profile.id });
    if (user) {
      // 如果找到了現有的使用者
      user.loginCount += 1;
      if (user.loginCount > 3) user.role = 'superuser';
      await user.save();
      return done(null, user);
    } else {
      // 創建新使用者
      const newUser = new User({
        googleId: profile.id,
        username: profile.displayName,
        name: profile.displayName,
        email: profile.emails?.[0]?.value,
        profileImage: profile.photos?.[0]?.value,
        level: 1,
        xp: 0,
        role: 'user',
        loginCount: 1
      });
      await newUser.save();
      return done(null, newUser);
    }
  } catch (err) {
    console.error("Google OAuth Error:", err);
    return done(err, null);
  }
}));


module.exports = passport;