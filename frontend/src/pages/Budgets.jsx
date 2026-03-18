import { useState, useEffect } from 'react';
import { getBudgets, setBudget, deleteBudget } from '../api/budgets';
import './Budgets.css';

const categories = ['Food', 'Transport', 'Shopping', 'Bills', 'Health', 'Entertainment', 'Other'];

const categoryIcons = {
  Food: '🍜', Transport: '🚌', Shopping: '🛍️',
  Bills: '⚡', Health: '💊', Entertainment: '🎮', Other: '📦'
};

const statusColors = {
  good: 'var(--accent)',
  warning: 'var(--orange)',
  over: 'var(--red)'
};

export default function Budgets() {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState('Food');
  const [amount, setAmount] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchBudgets = async () => {
    try {
      const res = await getBudgets();
      setBudgets(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBudgets(); }, []);

  const handleSet = async () => {
    if (!amount) return;
    setSaving(true);
    try {
      await setBudget({ category: selected, amount: parseFloat(amount) });
      setAmount('');
      await fetchBudgets();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteBudget(id);
      setBudgets(budgets.filter(b => b._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const totalBudget = budgets.reduce((sum, b) => sum + b.amount, 0);
  const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);
  const overBudget = budgets.filter(b => b.status === 'over');
  const warningBudget = budgets.filter(b => b.status === 'warning');

  return (
    <div className="budgets-page">
      <div className="budgets-header">
        <h1 className="budgets-title">Budgets</h1>
        <p className="budgets-sub">Set monthly limits per category</p>
      </div>

      {/* SUMMARY */}
      {budgets.length > 0 && (
        <div className="budget-summary">
          <div className="summary-card">
            <div className="summary-label">Total Budgeted</div>
            <div className="summary-value">₹{totalBudget.toLocaleString('en-IN')}</div>
          </div>
          <div className="summary-card">
            <div className="summary-label">Total Spent</div>
            <div className="summary-value" style={{ color: totalSpent > totalBudget ? 'var(--red)' : 'var(--text)' }}>
              ₹{totalSpent.toLocaleString('en-IN')}
            </div>
          </div>
          <div className="summary-card">
            <div className="summary-label">Remaining</div>
            <div className="summary-value" style={{ color: totalBudget - totalSpent < 0 ? 'var(--red)' : 'var(--accent)' }}>
              ₹{Math.abs(totalBudget - totalSpent).toLocaleString('en-IN')}
              {totalBudget - totalSpent < 0 ? ' over' : ' left'}
            </div>
          </div>
        </div>
      )}

      {/* ALERTS */}
      {overBudget.length > 0 && (
        <div className="alert alert-over">
          <span>⚠</span>
          <span>You've exceeded your budget for: {overBudget.map(b => b.category).join(', ')}</span>
        </div>
      )}
      {warningBudget.length > 0 && (
        <div className="alert alert-warning">
          <span>◈</span>
          <span>Approaching limit for: {warningBudget.map(b => b.category).join(', ')}</span>
        </div>
      )}

      {/* SET BUDGET FORM */}
      <div className="set-budget-card">
        <h2 className="set-budget-title">Set a Budget</h2>
        <div className="set-budget-form">
          <div className="category-select">
            {categories.map(cat => (
              <button
                key={cat}
                className={`cat-chip ${selected === cat ? 'selected' : ''}`}
                onClick={() => setSelected(cat)}
              >
                {categoryIcons[cat]} {cat}
              </button>
            ))}
          </div>
          <div className="amount-row">
            <input
              className="form-input"
              type="number"
              placeholder="Monthly limit in ₹"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              min="0"
            />
            <button className="set-btn" onClick={handleSet} disabled={saving}>
              {saving ? 'Saving...' : 'Set Budget'}
            </button>
          </div>
        </div>
      </div>

      {/* BUDGET LIST */}
      {loading ? (
        <div className="loading"><div className="loading-spinner" /></div>
      ) : budgets.length === 0 ? (
        <div className="empty">
          <div className="empty-icon">◈</div>
          <p>No budgets set yet. Add one above.</p>
        </div>
      ) : (
        <div className="budget-list">
          {budgets.map(budget => (
            <div key={budget._id} className={`budget-item ${budget.status}`}>
              <div className="budget-item-top">
                <div className="budget-item-left">
                  <span className="budget-icon">{categoryIcons[budget.category]}</span>
                  <div>
                    <div className="budget-category">{budget.category}</div>
                    <div className="budget-amounts">
                      ₹{budget.spent.toLocaleString('en-IN')} of ₹{budget.amount.toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>
                <div className="budget-item-right">
                  <span className={`budget-pct ${budget.status}`}>{budget.percentage}%</span>
                  <button className="delete-btn" onClick={() => handleDelete(budget._id)}>×</button>
                </div>
              </div>
              <div className="budget-bar-track">
                <div
                  className="budget-bar-fill"
                  style={{
                    width: `${Math.min(budget.percentage, 100)}%`,
                    background: statusColors[budget.status]
                  }}
                />
              </div>
              {budget.status === 'over' && (
                <div className="budget-msg over">Over by ₹{(budget.spent - budget.amount).toLocaleString('en-IN')}</div>
              )}
              {budget.status === 'warning' && (
                <div className="budget-msg warning">₹{(budget.amount - budget.spent).toLocaleString('en-IN')} remaining</div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}