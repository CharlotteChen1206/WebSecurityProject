const mongoose = require('mongoose');
const argon2 = require('argon2');
const crypto = require('crypto');

// 設定 AES 加密密鑰（32字節）
const ENCRYPTION_KEY = process.env.SECRET_KEY;
if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length !== 64) {
  throw new Error("SECRET_KEY 必須為 32 字節 (64 hex characters)!");
}
const IV_LENGTH = 16; // AES IV 長度

// 加密函數 (AES-256-CBC)
function encryptData(text) {
  if (!text) return '';
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY, 'hex'), iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted.toString();
}

/**
 * 解密函數 (AES-256-CBC)
 * @param {string} text - 加密的字串
 * @return {string} - 解密後的文字
 */
function decryptData(text) {
  if (!text) return '';
  const textParts = text.split(':');
  const iv = Buffer.from(textParts.shift(), 'hex');
  const encryptedText = Buffer.from(textParts.join(':'), 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}

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
    required: function () {
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
    maxLength: 500
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

/**
 * **加密 email 和 bio 在儲存前**
 */
UserSchema.pre('save', function (next) {
  if (this.email && !this.email.includes(':')) {
    this.email = encryptData(this.email);
  }
  if (this.bio && !this.bio.includes(':')) {
    this.bio = encryptData(this.bio);
  }
  next();
});

/**
 * **解密 email 和 bio 供前端使用**
 */
UserSchema.virtual('decryptedEmail').get(function () {
  return this.email ? decryptData(this.email) : '';
});

UserSchema.virtual('decryptedBio').get(function () {
  return this.bio ? decryptData(this.bio) : '';
});

/**
 * **驗證密碼**
 * @param {string} password - 用戶輸入的密碼
 * @return {Promise<boolean>} - 是否匹配
 */
UserSchema.methods.verifyPassword = async function (password) {
  return await argon2.verify(this.password, password);
};

module.exports = mongoose.model('User', UserSchema);
