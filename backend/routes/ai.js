const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const Expense = require('../models/Expense');
const Budget = require('../models/Budget');
const auth = require('../middleware/auth');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

router.post('/advice', auth, async (req, res) => {
  try {
    // Fetch last 60 days of expenses
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    const expenses = await Expense.find({
      user: req.userId,
      date: { $gte: sixtyDaysAgo }
    }).sort({ date: -1 });

    // Fetch current budgets
    const now = new Date();
    const budgets = await Budget.find({
      user: req.userId,
      month: now.getMonth(),
      year: now.getFullYear()
    });

    if (expenses.length === 0) {
      return res.json({
        advice: [{
          type: 'info',
          title: 'Not enough data',
          body: 'Add at least a few expenses to get personalised AI advice.'
        }]
      });
    }

    // Build spending summary
    const byCategory = {};
    expenses.forEach(e => {
      byCategory[e.category] = (byCategory[e.category] || 0) + e.amount;
    });

    const total = expenses.reduce((sum, e) => sum + e.amount, 0);

    const byMonth = {};
    expenses.forEach(e => {
      const key = new Date(e.date).toLocaleString('en-IN', { month: 'long', year: 'numeric' });
      byMonth[key] = (byMonth[key] || 0) + e.amount;
    });

    const byDayOfWeek = { Sun: 0, Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0 };
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    expenses.forEach(e => {
      byDayOfWeek[days[new Date(e.date).getDay()]] += e.amount;
    });

    const topExpenses = [...expenses]
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5)
      .map(e => `${e.title} (${e.category}): ₹${e.amount}`);

    const budgetSummary = budgets.map(b => {
      const spent = byCategory[b.category] || 0;
      return `${b.category}: budget ₹${b.amount}, spent ₹${spent} (${Math.round((spent / b.amount) * 100)}%)`;
    });

    // Build prompt
    const prompt = `You are a personal finance advisor for an Indian college student.
Analyse their spending data and give specific, actionable advice.

SPENDING DATA (last 60 days):
Total spent: ₹${total.toLocaleString('en-IN')}
Number of transactions: ${expenses.length}

By category:
${Object.entries(byCategory).sort((a, b) => b[1] - a[1]).map(([cat, amt]) => `- ${cat}: ₹${amt.toLocaleString('en-IN')} (${Math.round((amt / total) * 100)}%)`).join('\n')}

By month:
${Object.entries(byMonth).map(([m, amt]) => `- ${m}: ₹${amt.toLocaleString('en-IN')}`).join('\n')}

Spending by day of week:
${Object.entries(byDayOfWeek).map(([day, amt]) => `- ${day}: ₹${amt.toLocaleString('en-IN')}`).join('\n')}

Top 5 biggest expenses:
${topExpenses.join('\n')}

${budgetSummary.length > 0 ? `Budget status:\n${budgetSummary.join('\n')}` : 'No budgets set.'}

Give exactly 4 pieces of advice. Each must reference actual numbers from this data.

Respond ONLY with a valid JSON array, no markdown, no backticks, no extra text:
[
  {
    "type": "warning|positive|tip|info",
    "title": "short title max 6 words",
    "body": "2-3 sentences of specific actionable advice referencing their actual spending numbers"
  }
]`;

    // Call Gemini API
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const result = await model.generateContent(prompt);
    const responseText = result.response.text().trim();

    // Clean response — sometimes Gemini adds backticks despite instructions
    const cleaned = responseText
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();

    const advice = JSON.parse(cleaned);
    res.json({ advice });

  } catch (err) {
    console.error('AI error:', err.message);
    res.status(500).json({ error: 'Failed to get AI advice. Check your API key.' });
  }
});

module.exports = router;