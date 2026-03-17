import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { login as loginAPI, signup as signupAPI } from '../api/auth';
import './Auth.css';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = isLogin
        ? await loginAPI({ email: form.email, password: form.password })
        : await signupAPI(form);

      login(res.data.token, res.data.user);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-brand">
          <span className="auth-logo">◈</span>
          <span className="auth-name">Spendly</span>
        </div>
        <div className="auth-tagline">
          <h1>Know where<br />your money<br />actually goes.</h1>
          <p>Track spending. Spot patterns.<br />Spend smarter.</p>
        </div>
        <div className="auth-dots">
          <span className="dot dot-1" />
          <span className="dot dot-2" />
          <span className="dot dot-3" />
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-card">
          <div className="auth-toggle">
            <button
              className={isLogin ? 'toggle-btn active' : 'toggle-btn'}
              onClick={() => { setIsLogin(true); setError(''); }}
            >
              Log in
            </button>
            <button
              className={!isLogin ? 'toggle-btn active' : 'toggle-btn'}
              onClick={() => { setIsLogin(false); setError(''); }}
            >
              Sign up
            </button>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            {error && <div className="auth-error">{error}</div>}

            {!isLogin && (
              <div className="form-group">
                <label className="form-label">Name</label>
                <input
                  className="form-input"
                  name="name"
                  placeholder="Satyam Saraf"
                  value={form.name}
                  onChange={handleChange}
                  autoFocus
                />
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                className="form-input"
                name="email"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                className="form-input"
                name="password"
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
              />
            </div>

            <button className="auth-btn" type="submit" disabled={loading}>
              {loading ? 'Please wait...' : isLogin ? 'Log in →' : 'Create account →'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}