const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  name: String,
  price: String,
  description: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Item', itemSchema);
