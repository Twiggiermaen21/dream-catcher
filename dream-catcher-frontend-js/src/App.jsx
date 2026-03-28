import { BrowserRouter, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard/Dashboard';
import Journal   from './pages/Journal/Journal';
import NewEntry  from './pages/NewEntry/NewEntry';
import Insights  from './pages/Insights/Insights';
import Login     from './pages/Login/Login';
import { useAuthStore } from './store/authStore';

const NAV = [
  { to: '/',          icon: '🌙', label: 'Przegląd',  sub: 'Dzisiaj',      end: true },
  { to: '/journal',   icon: '📖', label: 'Dziennik',  sub: 'Wszystkie wpisy' },
  { to: '/new-entry', icon: '✦',  label: 'Nowy wpis', sub: 'Dodaj wpis'   },
  { to: '/insights',  icon: '✧',  label: 'Insights',  sub: 'Korelacje'    },
];

function Sidebar() {
  const { user, logout } = useAuthStore();

  return (
    <aside className="w-65 min-w-65 h-screen flex flex-col glass border-r-0 sticky top-0 z-50">

      {/* Brand */}
      <div className="p-8 pb-6 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-linear-to-br from-accent/40 to-accent/10 border border-accent/30 flex items-center justify-center text-xl shadow-glow-purple">
            🌙
          </div>
          <div>
            <div className="text-[#f0eeff] font-bold text-sm tracking-wide">Dream Catcher</div>
            <div className="text-muted text-[11px] mt-0.5">holistic journal</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 flex flex-col gap-1">
        <div className="text-muted text-[10px] font-bold tracking-widest uppercase px-3 mb-2">
          Nawigacja
        </div>
        {NAV.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) => `
              flex items-center gap-3 p-3 rounded-2xl transition-all duration-300 group
              ${isActive 
                ? 'bg-accent/15 border border-accent/25 shadow-glow-purple' 
                : 'hover:bg-white/5 border border-transparent'}
            `}
          >
            {({ isActive }) => (
              <>
                <div className={`
                  w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0 transition-all duration-300
                  ${isActive 
                    ? 'bg-accent/20 border border-accent/30 text-white' 
                    : 'bg-white/5 border border-white/5 text-muted group-hover:text-white'}
                `}>
                  {item.icon}
                </div>
                <div>
                  <div className={`text-[13px] transition-colors duration-300 ${isActive ? 'text-white font-semibold' : 'text-muted group-hover:text-[#d0cff0]'}`}>
                    {item.label}
                  </div>
                  <div className="text-muted/60 text-[11px] mt-0.5 font-medium">{item.sub}</div>
                </div>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User */}
      {user && (
        <div className="p-4 mb-4 border-t border-white/5">
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/10 glass">
            <div className="w-9 h-9 rounded-xl bg-linear-to-br from-accent to-pink flex items-center justify-center text-white text-sm font-bold shrink-0 shadow-glow-pink">
              {(user.displayName?.[0] ?? user.email?.[0] ?? '?').toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[#f0eeff] text-xs font-semibold truncate">
                {user.displayName ?? user.email}
              </div>
              <button
                onClick={logout}
                className="text-muted hover:text-pink text-[11px] mt-0.5 transition-colors cursor-pointer bg-transparent border-none p-0"
              >
                Wyloguj →
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}

function AppLayout() {
  return (
    <div className="flex bg-page h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto px-10 py-8 scroll-smooth">
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
