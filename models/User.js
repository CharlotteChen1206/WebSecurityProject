const mongoose = require('mongoose');
const argon2 = require('argon2');
const crypto = require('crypto');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    unique: true,
    sparse: true
  },
  password: {
    type: String,
    required: function() {
      // 僅當沒有 Google ID 時才需要密碼
      return !this.googleId;
    }
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true
  },
  name: {
    type: String
  },
  displayName: {
    type: String
  },
  bio: {
    type: String,
    default: '',
    maxLength: 500  // 限制字符數
  },
  profileImage: {
    type: String,
    default: '/default-profile.png'
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'superuser'],
    default: 'user'
  },
  level: {
    type: Number,
    default: 1
  },
  xp: {
    type: Number,
    default: 0
  },
  badges: {
    type: Array,
    default: []
  },
  refreshToken: {
    type: String
  },
  loginCount: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', UserSchema);