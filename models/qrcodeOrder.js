// qrcodeOrder.js
const mongoose = require('mongoose');

/** 取得台灣時間 (Asia/Taipei) 並轉為 yyyymmdd 格式 */
function getTaiwanDateString() {
  // 1. 先用 toLocaleString 產生 Asia/Taipei 的在地時間字串
  // 2. 再 new Date(…) 轉回正確的 Date 物件
  const taiwanDate = new Date(
    new Date().toLocaleString('en-US', { timeZone: 'Asia/Taipei' })
  );
  const year  = taiwanDate.getFullYear();
  const month = String(taiwanDate.getMonth() + 1).padStart(2, '0');
  const day   = String(taiwanDate.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
}

const qrcodeOrderSchema = new mongoose.Schema({
  tableNumber: { type: String, required: true },
  items: [{
    name:     { type: String, required: true },
    price:    { type: Number, required: true },
    quantity: { type: Number, required: true, default: 1 },
    spice:    { type: String },
    addons:   { type: [String], default: [] }
  }],
  status:      { type: String, enum: ['pending', 'completed'], default: 'pending' },
  // 把 default 設成函式呼叫，確保每次都重算
  createdAt:   { type: String, default: getTaiwanDateString }
});

module.exports = mongoose.model('QRCodeOrder', qrcodeOrderSchema);
