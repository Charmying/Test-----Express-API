const mongoose = require('mongoose');

const test2Schema = new mongoose.Schema({
  id: String,
  email: String,
  password: String,
  userName: String,
});

module.exports = mongoose.model('test2', test2Schema);
