const mongoose = require('mongoose');

const tableSchema = new mongoose.Schema({
  tableNumber: { type: String, required: true, unique: true },
  status: { type: String, enum: ['available', 'occupied'], default: 'available' },
  qrCodeUrl: { type: String, default: null }
});

module.exports = mongoose.model('Table', tableSchema);
