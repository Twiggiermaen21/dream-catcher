import { BrowserRouter, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard/Dashboard';
import Journal   from './pages/Journal/Journal';
import NewEntry  from './pages/NewEntry/NewEntry';
import Insights  from './pages/Insights/Insights';
import Login     from './pages/Login/Login';
import { useAuthStore } from './store/authStore';

const NAV_ITEMS = [
  { to: '/',          icon: '✦',  label: 'Przegląd' },
  { to: '/journal',   icon: '📖', label: 'Dziennik' },
  { to: '/new-entry', icon: '+',  label: 'Nowy wpis' },
  { to: '/insights',  icon: '📊', label: 'Insights' },
];

function AppLayout() {
  const { user, logout } = useAuthStore();

  return (
    <div style={{ display: 'flex', minHeight: '100vh', padding: 24, gap: 16, alignItems: 'flex-start' }}>

      {/* Sidebar */}
      <div className="card" style={{ width: 200, flexShrink: 0, padding: 12, position: 'sticky', top: 24 }}>
        {/* Logo */}
        <div style={{ padding: '8px 12px 16px', borderBottom: '1px solid var(--border)', marginBottom: 8 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
            🌙 <span>Dream Catcher</span>
          </div>
          {user && (
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
              {user.displayName}
            </div>
          )}
        </div>

        {/* Nav */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {NAV_ITEMS.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
            >
              <span style={{ fontSize: 16, width: 20, textAlign: 'center' }}>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        {user && (
          <div style={{ marginTop: 16, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
            <button
              onClick={logout}
              className="btn btn-ghost"
              style={{ width: '100%', justifyContent: 'center', fontSize: 13 }}
            >
              Wyloguj
            </button>
          </div>
        )}
      </div>

      {/* Main content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <Routes>
          <Route path="/"          element={<Dashboard />} />
          <Route path="/journal"   element={<Journal />} />
          <Route path="/new-entry" element={<NewEntry />} />
          <Route path="/insights"  element={<Insights />} />
        </Routes>
      </div>
    </div>
  );
}

function ProtectedRoute({ children }) {
  const { token } = useAuthStore();
  return token ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/*" element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}
