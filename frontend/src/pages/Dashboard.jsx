import { useState, useEffect } from 'react';
import { getExpenses, deleteExpense, updateExpense } from '../api/expenses';
import './Dashboard.css';

const categoryColors = {
  Food: '#ff8c42', Transport: '#4d9fff', Shopping: '#b06fff',
  Bills: '#ff4d4d', Health: '#4dffb0', Entertainment: '#c8f135', Other: '#999999'
};

const categoryIcons = {
  Food: '🍜', Transport: '🚌', Shopping: '🛍️',
  Bills: '⚡', Health: '💊', Entertainment: '🎮', Other: '📦'
};

const categories = ['Food', 'Transport', 'Shopping', 'Bills', 'Health', 'Entertainment', 'Other'];

function EditModal({ expense, onClose, onSave }) {
  const [form, setForm] = useState({
    title: expense.title,
    amount: expense.amount,
    category: expense.category,
    date: new Date(expense.date).toISOString().split('T')[0],
    note: expense.note || ''
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateExpense(expense._id, { ...form, amount: parseFloat(form.amount) });
      onSave();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Edit Expense</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label className="form-label">Title</label>
            <input
              className="form-input"
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Amount (₹)</label>
              <input
                className="form-input"
                type="number"
                value={form.amount}
                onChange={e => setForm({ ...form, amount: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Date</label>
              <input
                className="form-input"
                type="date"
                value={form.date}
                onChange={e => setForm({ ...form, date: e.target.value })}
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
              value={form.note}
              onChange={e => setForm({ ...form, note: e.target.value })}
              placeholder="Any extra details..."
            />
          </div>
          <div className="modal-actions">
            <button type="button" className="cancel-btn" onClick={onClose}>Cancel</button>
            <button type="submit" className="save-btn" disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingExpense, setEditingExpense] = useState(null);

  const fetchExpenses = async () => {
    try {
      const res = await getExpenses();
      setExpenses(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchExpenses(); }, []);

  const handleDelete = async (id) => {
    try {
      await deleteExpense(id);
      setExpenses(expenses.filter(e => e._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditSave = async () => {
    setEditingExpense(null);
    await fetchExpenses();
  };

  const exportCSV = () => {
    const headers = ['Title', 'Amount', 'Category', 'Date', 'Note'];
    const rows = expenses.map(e => [
      e.title,
      e.amount,
      e.category,
      new Date(e.date).toLocaleDateString('en-IN'),
      e.note || ''
    ]);

    const csv = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'spendly-expenses.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const total = expenses.reduce((sum, e) => sum + e.amount, 0);
  const byCategory = expenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount;
    return acc;
  }, {});
  const topCategory = Object.entries(byCategory).sort((a, b) => b[1] - a[1])[0];

  if (loading) return (
    <div className="loading">
      <div className="skeleton-grid">
        <div className="skeleton-card" />
        <div className="skeleton-card" />
        <div className="skeleton-card" />
      </div>
      <div className="skeleton-list">
        <div className="skeleton-item" />
        <div className="skeleton-item" />
        <div className="skeleton-item" />
        <div className="skeleton-item" />
      </div>
    </div>
  );

  return (
    <div className="dashboard">
      {editingExpense && (
        <EditModal
          expense={editingExpense}
          onClose={() => setEditingExpense(null)}
          onSave={handleEditSave}
        />
      )}

      <div className="dash-header">
        <div>
          <h1 className="dash-title">Dashboard</h1>
          <p className="dash-sub">Your spending at a glance</p>
        </div>
        <button className="export-btn" onClick={exportCSV}>
          ↓ Export CSV
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card accent">
          <div className="stat-label">Total Spent</div>
          <div className="stat-value">₹{total.toLocaleString('en-IN')}</div>
          <div className="stat-hint">{expenses.length} transactions</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Top Category</div>
          <div className="stat-value">{topCategory ? topCategory[0] : '—'}</div>
          <div className="stat-hint">{topCategory ? `₹${topCategory[1].toLocaleString('en-IN')}` : 'No data yet'}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Avg per Transaction</div>
          <div className="stat-value">₹{expenses.length ? Math.round(total / expenses.length).toLocaleString('en-IN') : 0}</div>
          <div className="stat-hint">per expense</div>
        </div>
      </div>

      {Object.keys(byCategory).length > 0 && (
        <div className="section">
          <h2 className="section-title">By Category</h2>
          <div className="category-bars">
            {Object.entries(byCategory).sort((a, b) => b[1] - a[1]).map(([cat, amt]) => (
              <div key={cat} className="cat-bar-row">
                <div className="cat-bar-label">
                  <span>{categoryIcons[cat]}</span>
                  <span>{cat}</span>
                </div>
                <div className="cat-bar-track">
                  <div
                    className="cat-bar-fill"
                    style={{ width: `${(amt / total) * 100}%`, background: categoryColors[cat] }}
                  />
                </div>
                <div className="cat-bar-amount">₹{amt.toLocaleString('en-IN')}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="section">
        <h2 className="section-title">Recent Expenses</h2>
        {expenses.length === 0 ? (
          <div className="empty">
            <div className="empty-icon">◈</div>
            <p>No expenses yet. Add your first one!</p>
          </div>
        ) : (
          <div className="expense-list">
            {expenses.map(expense => (
              <div key={expense._id} className="expense-item">
                <div
                  className="expense-icon"
                  style={{
                    background: categoryColors[expense.category] + '22',
                    color: categoryColors[expense.category]
                  }}
                >
                  {categoryIcons[expense.category]}
                </div>
                <div className="expense-info">
                  <div className="expense-title">{expense.title}</div>
                  <div className="expense-meta">
                    <span className="expense-cat">{expense.category}</span>
                    {expense.note && <span className="expense-note">· {expense.note}</span>}
                    <span className="expense-date">· {new Date(expense.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                  </div>
                </div>
                <div className="expense-right">
                  <div className="expense-amount">₹{expense.amount.toLocaleString('en-IN')}</div>
                  <button className="edit-btn" onClick={() => setEditingExpense(expense)}>✎</button>
                  <button className="delete-btn" onClick={() => handleDelete(expense._id)}>×</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}