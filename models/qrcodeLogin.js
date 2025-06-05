const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const qrcodeLoginSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, default: 'user' },
});

qrcodeLoginSchema.methods.validatePassword = async function(password) {
  return bcrypt.compare(password, this.passwordHash);
};

module.exports = mongoose.model('QrcodeLogin', qrcodeLoginSchema);
