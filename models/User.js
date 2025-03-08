const mongoose = require('mongoose');
const argon2 = require('argon2');
const crypto = require('crypto');

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: function () { return !this.googleId; }, // 如果是本地帳號，則必須填寫
        unique: function () { return !this.googleId; } // 避免 Google 帳號重複
    },
    password: {
        type: String,
        required: function () { return !this.googleId; } // 只有本地帳號才需要密碼
    },
    googleId: {
        type: String,
        unique: true,  // Google SSO 使用
        sparse: true  // 確保不會影響本地帳號的唯一性
    },
    loginCount: {
        type: Number,
        default: 0
    },
    role: {
        type: String,
        enum: ['user', 'superuser', 'admin'], // 支援 Google SSO 使用者升級
        default: 'user'
    },
    refreshToken: { type: String }

}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);