const express = require('express');
const router = express.Router();
const Expense = require('../models/Expense');
const auth = require('../middleware/auth');

// All routes below require a valid token
// auth middleware runs first, attaches req.userId, then the route handler runs

// POST /api/expenses
router.post('/', auth, async (req, res) => {
  try {
    const expense = new Expense({
      ...req.body,
      user: req.userId    // attach the logged-in user's id
    });
    await expense.save();
    res.status(201).json(expense);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET /api/expenses
router.get('/', auth, async (req, res) => {
  try {
    // Only fetch expenses belonging to this user
    const expenses = await Expense.find({ user: req.userId }).sort({ date: -1 });
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/expenses/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    // Make sure user can only delete their own expenses
    const expense = await Expense.findOne({ _id: req.params.id, user: req.userId });
    if (!expense) {
      return res.status(404).json({ error: 'Expense not found' });
    }
    await expense.deleteOne();
    res.json({ message: 'Expense deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/expenses/analytics
router.get('/analytics', auth, async (req, res) => {
  try {
    // Only analyse this user's expenses
    const expenses = await Expense.find({ user: req.userId });

    const byCategory = {};
    expenses.forEach(e => {
      byCategory[e.category] = (byCategory[e.category] || 0) + e.amount;
    });

    const byMonth = {};
    expenses.forEach(e => {
      const key = new Date(e.date).toLocaleString('en-IN', { month: 'short', year: '2-digit' });
      byMonth[key] = (byMonth[key] || 0) + e.amount;
    });

    const byDayOfWeek = { Sun: 0, Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0 };
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    expenses.forEach(e => {
      const day = days[new Date(e.date).getDay()];
      byDayOfWeek[day] += e.amount;
    });

    const total = expenses.reduce((sum, e) => sum + e.amount, 0);
    const avg = expenses.length ? total / expenses.length : 0;

    const now = new Date();
    const thisMonth = expenses.filter(e => {
      const d = new Date(e.date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
    const lastMonth = expenses.filter(e => {
      const d = new Date(e.date);
      const lm = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      return d.getMonth() === lm.getMonth() && d.getFullYear() === lm.getFullYear();
    });

    const thisMonthTotal = thisMonth.reduce((sum, e) => sum + e.amount, 0);
    const lastMonthTotal = lastMonth.reduce((sum, e) => sum + e.amount, 0);
    const monthChange = lastMonthTotal
      ? Math.round(((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100)
      : null;

    const insights = [];
    const sortedCats = Object.entries(byCategory).sort((a, b) => b[1] - a[1]);
    const topCat = sortedCats[0];

    if (topCat) {
      const pct = Math.round((topCat[1] / total) * 100);
      if (pct > 35) {
        insights.push({
          type: 'warning',
          text: `${topCat[0]} is eating ${pct}% of your total spend — consider setting a budget limit.`
        });
      }
    }

    if (monthChange !== null) {
      if (monthChange > 20) {
        insights.push({
          type: 'warning',
          text: `You've spent ${monthChange}% more this month than last. You're on track to overshoot.`
        });
      } else if (monthChange < 0) {
        insights.push({
          type: 'positive',
          text: `You've spent ${Math.abs(monthChange)}% less this month than last. Good progress.`
        });
      }
    }

    const weekendSpend = (byDayOfWeek['Sat'] || 0) + (byDayOfWeek['Sun'] || 0);
    const weekendPct = Math.round((weekendSpend / total) * 100);
    if (weekendPct > 40) {
      insights.push({
        type: 'info',
        text: `${weekendPct}% of your spending happens on weekends. Weekend plans are your biggest trigger.`
      });
    }

    if (sortedCats.length >= 2) {
      insights.push({
        type: 'info',
        text: `Your top two categories — ${sortedCats[0][0]} and ${sortedCats[1][0]} — account for ${Math.round(((sortedCats[0][1] + sortedCats[1][1]) / total) * 100)}% of all spending.`
      });
    }

    if (insights.length === 0) {
      insights.push({ type: 'info', text: 'Add more expenses to unlock spending insights.' });
    }

    res.json({ byCategory, byMonth, byDayOfWeek, total, avg, thisMonthTotal, lastMonthTotal, monthChange, insights });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/expenses/:id — edit an expense
router.put('/:id', auth, async (req, res) => {
  try {
    const expense = await Expense.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      req.body,
      { new: true, runValidators: true }
      // new: true = return updated document
      // runValidators = enforce schema rules on update too
    );
    if (!expense) return res.status(404).json({ error: 'Expense not found' });
    res.json(expense);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
