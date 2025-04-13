/**
 * test1 資料模型
 * 用於測試用途的簡單資料結構
 */

const mongoose = require('mongoose');

const test1Schema = new mongoose.Schema({
  id: {
    type: String,
    trim: true
  },
  userName: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true
  },
  password: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  // 增加時間戳記
  timestamps: true
});

// 將集合名稱明確設定為 test1
module.exports = mongoose.model('test1', test1Schema, 'test1');
