const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Food', 'Transport', 'Shopping', 'Bills', 'Health', 'Entertainment', 'Other']
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  month: {
    type: Number,  // 0-11 (January = 0)
    required: true
  },
  year: {
    type: Number,
    required: true
  }
}, {
  timestamps: true
});

// One budget per category per month per user
budgetSchema.index({ user: 1, category: 1, month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('Budget', budgetSchema);