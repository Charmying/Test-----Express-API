/**
 * users 資料模型
 * 定義使用者資料結構與方法
 */

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  account: { 
    type: String, 
    unique: true, 
    required: [true, '帳號為必填欄位'], 
    trim: true 
  },
  email: { 
    type: String, 
    unique: true, 
    required: [true, '電子郵件為必填欄位'], 
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, '請輸入有效的電子郵件地址']
  },
  password: { 
    type: String, 
    required: [true, '密碼為必填欄位'],
    minlength: [6, '密碼長度至少需要6個字元']
  },
  userName: { 
    type: String, 
    required: [true, '使用者名稱為必填欄位'], 
    trim: true 
  },
  phone: { 
    type: String, 
    required: [true, '電話號碼為必填欄位'], 
    trim: true 
  },
  address: { 
    type: String,
    trim: true
  },
  bio: { 
    type: String 
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  // 在轉換為 JSON 時去除密碼欄位
  toJSON: {
    transform: function(doc, ret) {
      delete ret.password;
      return ret;
    }
  }
});

/**
 * 在儲存使用者之前對密碼進行雜湊處理
 * 只有在密碼被修改時才進行雜湊
 */
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    // 使用 bcrypt 對密碼進行雜湊處理
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

/**
 * 驗證使用者密碼的方法
 * @param {string} candidatePassword - 待驗證的密碼
 * @returns {Promise<boolean>} - 密碼是否匹配
 */
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
