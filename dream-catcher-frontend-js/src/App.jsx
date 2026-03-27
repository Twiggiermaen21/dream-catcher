import { BrowserRouter, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard/Dashboard';
import Journal   from './pages/Journal/Journal';
import NewEntry  from './pages/NewEntry/NewEntry';
import Insights  from './pages/Insights/Insights';
import Login     from './pages/Login/Login';
import { useAuthStore } from './store/authStore';

const NAV = [
  { to: '/',          icon: '✦',  label: 'Przegląd',  end: true },
  { to: '/journal',   icon: '📖', label: 'Dziennik' },
  { to: '/new-entry', icon: '+',  label: 'Nowy wpis' },
  { to: '/insights',  icon: '📊', label: 'Insights' },
];

function Sidebar() {
  const { user, logout } = useAuthStore();
  return (
    <aside className="w-48 shrink-0 sticky top-6 self-start bg-white rounded-2xl shadow-sm overflow-hidden">
      {/* Logo */}
      <div className="px-4 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2 font-bold text-gray-900">
          🌙 <span>Dream Catcher</span>
        </div>
        {user && (
          <div className="text-xs text-gray-400 mt-1 truncate">{user.displayName}</div>
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
              `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors no-underline
               ${isActive
                 ? 'bg-gray-100 text-gray-900'
                 : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'}`
            }
          >
            <span className="w-5 text-center text-base">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      {user && (
        <div className="p-2 border-t border-gray-100">
          <button
            onClick={logout}
            className="w-full text-sm text-gray-400 hover:text-gray-600 py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors text-left cursor-pointer border-none bg-transparent"
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
