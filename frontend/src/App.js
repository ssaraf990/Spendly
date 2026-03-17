import { BrowserRouter, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Dashboard from './pages/Dashboard';
import AddExpense from './pages/AddExpense';
import Analytics from './pages/Analytics';
import Auth from './pages/Auth';
import Budgets from './pages/Budgets';
import AIAdvisor from './pages/AIAdvisor';
import './App.css';


// ProtectedRoute — if not logged in, redirect to /auth
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/auth" />;
  return children;
}

function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = require('react-router-dom').useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  return (
    <div className="app">
      <nav className="nav">
        {/* LEFT — brand */}
        <div className="nav-brand">
          <div className="nav-logo">S</div>
          <span className="nav-title">Spendly</span>
        </div>

        {/* CENTRE — links */}
        <div className="nav-links">
          <NavLink to="/" end className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            Dashboard
          </NavLink>
          <NavLink to="/analytics" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            Analytics
          </NavLink>
          <NavLink to="/budgets" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            Budgets
          </NavLink>
          <NavLink to="/ai" className={({ isActive }) => isActive ? 'nav-link ai-link active' : 'nav-link ai-link'}>
            ✦ AI
          </NavLink>
          <NavLink to="/add" className={({ isActive }) => isActive ? 'nav-add active' : 'nav-add'}>
            + Add
          </NavLink>
        </div>

        {/* RIGHT — user */}
        <div className="nav-right">
          <span className="nav-user">Hey, <span>{user?.name?.split(' ')[0]}</span></span>
          <button className="nav-logout" onClick={handleLogout}>Logout</button>
        </div>
      </nav>

      <main className="main">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/budgets" element={<Budgets />} />
          <Route path="/ai" element={<AIAdvisor />} />
          <Route path="/add" element={<AddExpense />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route path="/*" element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;