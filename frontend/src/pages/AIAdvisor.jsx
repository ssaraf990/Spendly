import { useState } from 'react';
import { getAIAdvice } from '../api/ai';
import './AIAdvisor.css';

const typeConfig = {
  warning: { icon: '⚠', color: 'var(--red)', bg: 'var(--red-dim)', border: 'rgba(255,77,77,0.25)' },
  positive: { icon: '↑', color: 'var(--accent)', bg: 'var(--accent-dim)', border: 'var(--accent-border)' },
  tip: { icon: '◎', color: 'var(--blue)', bg: 'var(--blue-dim)', border: 'rgba(77,159,255,0.25)' },
  info: { icon: '◈', color: 'var(--purple)', bg: 'var(--purple-dim)', border: 'rgba(176,111,255,0.25)' }
};

export default function AIAdvisor() {
  const [advice, setAdvice] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasLoaded, setHasLoaded] = useState(false);

  const fetchAdvice = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getAIAdvice();
      setAdvice(res.data.advice);
      setHasLoaded(true);
    } catch (err) {
      setError('Failed to get advice. Check your API key.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ai-page">
      <div className="ai-header">
        <div className="ai-header-left">
          <div className="ai-badge">AI Powered</div>
          <h1 className="ai-title">Financial Advisor</h1>
          <p className="ai-sub">
            Gemini analyses your spending patterns and gives you personalised advice.
          </p>
        </div>
        <button
          className={`ai-btn ${loading ? 'loading' : ''}`}
          onClick={fetchAdvice}
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="btn-spinner" />
              Analysing...
            </>
          ) : hasLoaded ? (
            '↻ Refresh Advice'
          ) : (
            '✦ Get AI Advice'
          )}
        </button>
      </div>

      {error && <div className="ai-error">{error}</div>}

      {!hasLoaded && !loading && (
        <div className="ai-empty">
          <div className="ai-empty-graphic">
            <div className="empty-circle c1" />
            <div className="empty-circle c2" />
            <div className="empty-circle c3" />
            <span className="empty-icon">✦</span>
          </div>
          <h2>Ready to analyse your finances</h2>
          <p>Click the button above and Gemini will analyse your spending patterns, identify problem areas, and suggest specific ways to save money.</p>
        </div>
      )}

      {loading && (
        <div className="ai-loading">
          <div className="loading-bar">
            <div className="loading-bar-fill" />
          </div>
          <p>Analysing your spending patterns...</p>
        </div>
      )}

      {hasLoaded && !loading && advice.length > 0 && (
        <div className="advice-grid">
          {advice.map((item, i) => {
            const config = typeConfig[item.type] || typeConfig.info;
            return (
              <div
                key={i}
                className="advice-card"
                style={{
                  '--card-color': config.color,
                  '--card-bg': config.bg,
                  '--card-border': config.border,
                  animationDelay: `${i * 0.1}s`
                }}
              >
                <div className="advice-card-header">
                  <span className="advice-icon">{config.icon}</span>
                  <span className="advice-type">{item.type}</span>
                </div>
                <h3 className="advice-title">{item.title}</h3>
                <p className="advice-body">{item.body}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}