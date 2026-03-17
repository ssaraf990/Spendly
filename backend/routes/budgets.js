const express = require('express');
const router = express.Router();
const Budget = require('../models/Budget');
const Expense = require('../models/Expense');
const auth = require('../middleware/auth');

// GET /api/budgets — get all budgets with current month spending
router.get('/', auth, async (req, res) => {
  try {
    const now = new Date();
    const month = now.getMonth();
    const year = now.getFullYear();

    // Get all budgets for this user this month
    const budgets = await Budget.find({ user: req.userId, month, year });

    // Get this month's expenses for this user
    const startOfMonth = new Date(year, month, 1);
    const endOfMonth = new Date(year, month + 1, 0);
    const expenses = await Expense.find({
      user: req.userId,
      date: { $gte: startOfMonth, $lte: endOfMonth }
    });

    // Calculate spending per category this month
    const spentByCategory = {};
    expenses.forEach(e => {
      spentByCategory[e.category] = (spentByCategory[e.category] || 0) + e.amount;
    });

    // Attach spent amount and percentage to each budget
    const budgetsWithSpending = budgets.map(b => {
      const spent = spentByCategory[b.category] || 0;
      const percentage = Math.round((spent / b.amount) * 100);
      return {
        ...b.toObject(),
        spent,
        percentage,
        status: percentage >= 100 ? 'over' : percentage >= 80 ? 'warning' : 'good'
      };
    });

    res.json(budgetsWithSpending);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/budgets — set a budget
router.post('/', auth, async (req, res) => {
  try {
    const now = new Date();
    const { category, amount } = req.body;

    // findOneAndUpdate with upsert — update if exists, create if not
    const budget = await Budget.findOneAndUpdate(
      {
        user: req.userId,
        category,
        month: now.getMonth(),
        year: now.getFullYear()
      },
      { amount },
      { upsert: true, new: true }
      // upsert: true = create if not found
      // new: true = return the updated document
    );

    res.json(budget);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/budgets/:id — remove a budget
router.delete('/:id', auth, async (req, res) => {
  try {
    await Budget.findOneAndDelete({ _id: req.params.id, user: req.userId });
    res.json({ message: 'Budget removed' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;