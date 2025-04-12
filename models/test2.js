/**
 * Test2 資料模型
 * 用於測試用途的簡單資料結構
 */

const mongoose = require('mongoose');

const test2Schema = new mongoose.Schema({
  id: {
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
  userName: {
    type: String,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  // 增加時間戳記
  timestamps: true
});

// 將集合名稱明確設定為 test2
module.exports = mongoose.model('test2', test2Schema, 'test2');
