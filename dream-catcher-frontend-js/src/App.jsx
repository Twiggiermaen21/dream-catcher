import { BrowserRouter, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard/Dashboard';
import Journal   from './pages/Journal/Journal';
import NewEntry  from './pages/NewEntry/NewEntry';
import Insights  from './pages/Insights/Insights';
import Login     from './pages/Login/Login';
import { useAuthStore } from './store/authStore';

const NAV = [
  { to: '/',          icon: '🌙', label: 'Przegląd',  end: true },
  { to: '/journal',   icon: '📖', label: 'Dziennik' },
  { to: '/new-entry', icon: '✦',  label: 'Nowy wpis' },
  { to: '/insights',  icon: '✧',  label: 'Insights' },
];

function Sidebar() {
  const { user, logout } = useAuthStore();
  return (
    <aside
      className="w-52 shrink-0 sticky top-6 self-start rounded-2xl overflow-hidden"
      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', backdropFilter: 'blur(12px)' }}
    >
      {/* Logo */}
      <div className="px-4 py-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-2 font-bold text-white text-sm tracking-wide">
          🌙 <span>Dream Catcher</span>
        </div>
        {user && (
          <div className="text-xs mt-1 truncate" style={{ color: '#8b8aaa' }}>{user.displayName}</div>
        )}
      </div>

      {/* Nav */}
      <nav className="p-2 flex flex-col gap-0.5">
        {NAV.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all no-underline
               ${isActive
                 ? 'text-white'
                 : 'hover:text-white'}`
            }
            style={({ isActive }) => isActive
              ? { background: 'rgba(124,106,245,0.2)', color: '#c4baff', boxShadow: 'inset 0 0 0 1px rgba(124,106,245,0.3)' }
              : { color: '#8b8aaa' }
            }
          >
            <span className="w-5 text-center text-base">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      {user && (
        <div className="p-2" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <button
            onClick={logout}
            className="w-full text-sm py-2 px-3 rounded-xl transition-all text-left cursor-pointer border-none bg-transparent"
            style={{ color: '#8b8aaa' }}
            onMouseEnter={e => { e.currentTarget.style.color = '#f0eeff'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = '#8b8aaa'; e.currentTarget.style.background = 'transparent'; }}
          >
            Wyloguj
          </button>
        </div>
      )}
    </aside>
  );
}

function AppLayout() {
  return (
    <div className="flex gap-4 p-6 items-start min-h-screen">
      <Sidebar />
      <main className="flex-1 min-w-0">
        <Routes>
          <Route path="/"          element={<Dashboard />} />
          <Route path="/journal"   element={<Journal />} />
          <Route path="/new-entry" element={<NewEntry />} />
          <Route path="/insights"  element={<Insights />} />
        </Routes>
      </main>
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
          <ProtectedRoute><AppLayout /></ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}
