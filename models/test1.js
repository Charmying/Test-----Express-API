const mongoose = require('mongoose');

const test1Schema = new mongoose.Schema({
  id: String,
  userName: String,
  email: String,
  password: String,
});

module.exports = mongoose.model('test1', test1Schema);
