const mongoose = require('mongoose');

const qrcodeOrderSchema = new mongoose.Schema({
  tableNumber: { type: String, required: true },
  items: [{
    name: { type: String, required: true },
    price: { type: Number, required: true }
  }],
  status: { type: String, enum: ['pending', 'completed'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('QRCodeOrder', qrcodeOrderSchema);
