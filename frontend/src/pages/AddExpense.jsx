import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addExpense } from '../api/expenses';
import './AddExpense.css';

const categories = ['Food', 'Transport', 'Shopping', 'Bills', 'Health', 'Entertainment', 'Other'];

const categoryIcons = {
  Food: '🍜', Transport: '🚌', Shopping: '🛍️',
  Bills: '⚡', Health: '💊', Entertainment: '🎮', Other: '📦'
};

export default function AddExpense() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '', amount: '', category: 'Food', date: new Date().toISOString().split('T')[0], note: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.amount) { setError('Title and amount are required'); return; }
    setLoading(true);
    setError('');
    try {
      await addExpense({ ...form, amount: parseFloat(form.amount) });
      navigate('/');
    } catch (err) {
      setError('Failed to add expense. Try again.');
      setLoading(false);
    }
  };

  return (
    <div className="add-page">
      <div className="add-header">
        <h1 className="add-title">New Expense</h1>
        <p className="add-sub">Track where your money went</p>
      </div>

      <form className="add-form" onSubmit={handleSubmit}>
        {error && <div className="form-error">{error}</div>}

        <div className="form-group">
          <label className="form-label">What did you spend on?</label>
          <input
            className="form-input"
            name="title"
            placeholder="e.g. Zomato, Uber, Netflix..."
            value={form.title}
            onChange={handleChange}
            autoFocus
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Amount (₹)</label>
            <input
              className="form-input"
              name="amount"
              type="number"
              placeholder="0"
              value={form.amount}
              onChange={handleChange}
              min="0"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Date</label>
            <input
              className="form-input"
              name="date"
              type="date"
              value={form.date}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Category</label>
          <div className="category-grid">
            {categories.map(cat => (
              <button
                key={cat}
                type="button"
                className={`cat-btn ${form.category === cat ? 'selected' : ''}`}
                onClick={() => setForm({ ...form, category: cat })}
              >
                <span>{categoryIcons[cat]}</span>
                <span>{cat}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Note <span className="optional">(optional)</span></label>
          <input
            className="form-input"
            name="note"
            placeholder="Any extra details..."
            value={form.note}
            onChange={handleChange}
          />
        </div>

        <button className="submit-btn" type="submit" disabled={loading}>
          {loading ? 'Saving...' : 'Save Expense →'}
        </button>
      </form>
    </div>
  );
}