import { useState, useEffect } from 'react';
import { getAnalytics } from '../api/expenses';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Cell
} from 'recharts';
import './Analytics.css';

const categoryColors = {
  Food: '#ff8c42', Transport: '#4d9fff', Shopping: '#b06fff',
  Bills: '#ff4d4d', Health: '#4dffb0', Entertainment: '#c8f135', Other: '#999999'
};

const insightIcons = { warning: '⚠', positive: '↑', info: '◈' };
const insightColors = { warning: '--orange', positive: '--accent', info: '--blue' };

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="chart-tooltip">
        <div className="tooltip-label">{label}</div>
        <div className="tooltip-value">₹{payload[0].value.toLocaleString('en-IN')}</div>
      </div>
    );
  }
  return null;
};

export default function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAnalytics()
      .then(res => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="loading">
      <div className="loading-spinner" />
    </div>
  );

  const monthData = Object.entries(data.byMonth).map(([month, amount]) => ({ month, amount }));
  const dayData = Object.entries(data.byDayOfWeek).map(([day, amount]) => ({ day, amount }));
  const catData = Object.entries(data.byCategory)
    .sort((a, b) => b[1] - a[1])
    .map(([cat, amount]) => ({ cat, amount }));

  return (
    <div className="analytics">
      <div className="analytics-header">
        <h1 className="analytics-title">Analytics</h1>
        <p className="analytics-sub">Patterns in your spending behaviour</p>
      </div>

      {/* INSIGHTS */}
      <div className="section">
        <h2 className="section-title">Smart Insights</h2>
        <div className="insights-list">
          {data.insights.map((insight, i) => (
            <div key={i} className={`insight-card ${insight.type}`}>
              <span className="insight-icon">{insightIcons[insight.type]}</span>
              <p className="insight-text">{insight.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* MONTH COMPARISON */}
      <div className="two-col">
        <div className="stat-card">
          <div className="stat-label">This Month</div>
          <div className="stat-value">₹{data.thisMonthTotal.toLocaleString('en-IN')}</div>
          {data.monthChange !== null && (
            <div className={`month-change ${data.monthChange > 0 ? 'up' : 'down'}`}>
              {data.monthChange > 0 ? '↑' : '↓'} {Math.abs(data.monthChange)}% vs last month
            </div>
          )}
        </div>
        <div className="stat-card">
          <div className="stat-label">Last Month</div>
          <div className="stat-value">₹{data.lastMonthTotal.toLocaleString('en-IN')}</div>
          <div className="stat-hint">previous period</div>
        </div>
      </div>

      {/* MONTHLY TREND */}
      {monthData.length > 0 && (
        <div className="section">
          <h2 className="section-title">Monthly Trend</h2>
          <div className="chart-card">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={monthData} barSize={32}>
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#666', fontSize: 12 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#666', fontSize: 12 }}
                  tickFormatter={v => `₹${(v/1000).toFixed(0)}k`}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
                  {monthData.map((_, i) => (
                    <Cell
                      key={i}
                      fill={i === monthData.length - 1 ? '#c8f135' : '#2a2a2a'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* DAY OF WEEK */}
      <div className="section">
        <h2 className="section-title">Spending by Day of Week</h2>
        <div className="chart-card">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={dayData} barSize={28}>
              <XAxis
                dataKey="day"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#666', fontSize: 12 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#666', fontSize: 12 }}
                tickFormatter={v => `₹${(v/1000).toFixed(0)}k`}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
              <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                {dayData.map((entry, i) => (
                  <Cell
                    key={i}
                    fill={entry.day === 'Sat' || entry.day === 'Sun' ? '#ff8c42' : '#2a2a2a'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="chart-legend">
            <span className="legend-dot" style={{ background: '#ff8c42' }} /> Weekend
            <span className="legend-dot" style={{ background: '#2a2a2a', border: '1px solid #333' }} /> Weekday
          </div>
        </div>
      </div>

      {/* CATEGORY BREAKDOWN */}
      <div className="section">
        <h2 className="section-title">Category Breakdown</h2>
        <div className="chart-card">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={catData} barSize={32} layout="vertical">
              <XAxis
                type="number"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#666', fontSize: 12 }}
                tickFormatter={v => `₹${(v/1000).toFixed(0)}k`}
              />
              <YAxis
                type="category"
                dataKey="cat"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#999', fontSize: 13 }}
                width={90}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
              <Bar dataKey="amount" radius={[0, 6, 6, 0]}>
                {catData.map((entry, i) => (
                  <Cell key={i} fill={categoryColors[entry.cat] || '#999'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}