const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  teamCode: { type: String, required: true },
  description: { type: String, required: true },
  amount: { type: Number, required: true },
  paidBy: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Expense', expenseSchema);