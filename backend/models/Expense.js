const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,  // stores a reference to a User document
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,        // can't save an expense without a title
    trim: true             // removes accidental spaces
  },
  amount: {
    type: Number,
    required: true,
    min: 0                 // amount can't be negative
  },
  category: {
    type: String,
    required: true,
    enum: ['Food', 'Transport', 'Shopping', 'Bills', 'Health', 'Entertainment', 'Other']

  },
  date: {
    type: Date,
    required: true,
    default: Date.now      // if no date given, use today
  },
  note: {
    type: String,
    trim: true,
    default: ''            // optional field
  }
}, {
  timestamps: true         // auto adds createdAt and updatedAt fields
});

module.exports = mongoose.model('Expense', expenseSchema);