const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
//   origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  origin: '*',
  credentials: true
}));
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/openbill')
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Models
const Group = require('./models/Group');
const Expense = require('./models/Expense');

// Routes
// Create/Join Group
app.post('/api/groups', async (req, res) => {
  try {
    const { name, memberName } = req.body;
    
    // Generate unique team code
    const teamCode = Math.random().toString(36).substr(2, 8).toUpperCase();
    
    const group = new Group({
      name,
      teamCode,
      members: [memberName],
      createdAt: new Date()
    });
    
    await group.save();
    res.json({ success: true, group });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Join existing group
app.post('/api/groups/join', async (req, res) => {
  try {
    const { teamCode, memberName } = req.body;
    
    const group = await Group.findOne({ teamCode });
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }
    
    if (!group.members.includes(memberName)) {
      group.members.push(memberName);
      await group.save();
    }
    
    res.json({ success: true, group });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get group details
app.get('/api/groups/:teamCode', async (req, res) => {
  try {
    const group = await Group.findOne({ teamCode: req.params.teamCode });
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }
    
    const expenses = await Expense.find({ teamCode: req.params.teamCode })
      .sort({ createdAt: -1 });
    
    res.json({ group, expenses });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add expense
app.post('/api/expenses', async (req, res) => {
  try {
    const { teamCode, description, amount, paidBy } = req.body;
    
    const expense = new Expense({
      teamCode,
      description,
      amount: parseFloat(amount),
      paidBy,
      createdAt: new Date()
    });
    
    await expense.save();
    res.json({ success: true, expense });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete expense
app.delete('/api/expenses/:id', async (req, res) => {
  try {
    await Expense.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});