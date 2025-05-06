const mongoose = require('mongoose');

const qrcodeOrderSchema = new mongoose.Schema({
  tableNumber: { type: String, required: true },
  items: [{
    name:     { type: String, required: true },
    price:    { type: Number, required: true },
    quantity: { type: Number, required: true, default: 1 },
    spice:    { type: String },
    addons:   { type: [String], default: [] }
  }],
  status:    { type: String, enum: ['pending', 'completed'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('QRCodeOrder', qrcodeOrderSchema);
