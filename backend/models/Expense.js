const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  teamCode: { type: String, required: true },
  description: { type: String, required: true },
  amount: { type: Number, required: true },
  paidBy: { type: String, required: true },
  splitBetween: [{ type: String, required: true }], // Array of member names who should split this expense
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Expense', expenseSchema);