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
    <aside style={{
      width: 230,
      minWidth: 230,
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: 'rgba(255,255,255,0.03)',
      borderRight: '1px solid rgba(255,255,255,0.06)',
      backdropFilter: 'blur(20px)',
      position: 'sticky',
      top: 0,
    }}>

      {/* Brand */}
      <div style={{ padding: '28px 20px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 12,
            background: 'linear-gradient(135deg, rgba(124,106,245,0.4), rgba(80,60,200,0.4))',
            border: '1px solid rgba(124,106,245,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18,
            boxShadow: '0 0 20px rgba(124,106,245,0.2)',
          }}>🌙</div>
          <div>
            <div style={{ color: '#f0eeff', fontWeight: 700, fontSize: 14, letterSpacing: '0.02em' }}>Dream Catcher</div>
            <div style={{ color: '#8b8aaa', fontSize: 11, marginTop: 1 }}>holistic journal</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        <div style={{ color: '#8b8aaa', fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '8px 10px 6px' }}>
          Nawigacja
        </div>
        {NAV.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '10px 12px', borderRadius: 12,
              textDecoration: 'none', transition: 'all 0.15s',
              ...(isActive
                ? { background: 'rgba(124,106,245,0.18)', boxShadow: 'inset 0 0 0 1px rgba(124,106,245,0.28)' }
                : { background: 'transparent' }
              )
            })}
          >
            {({ isActive }) => (
              <>
                <div style={{
                  width: 34, height: 34, borderRadius: 10,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 16, flexShrink: 0,
                  background: isActive ? 'rgba(124,106,245,0.25)' : 'rgba(255,255,255,0.05)',
                  border: isActive ? '1px solid rgba(124,106,245,0.35)' : '1px solid rgba(255,255,255,0.06)',
                }}>
                  {item.icon}
                </div>
                <div>
                  <div style={{ color: isActive ? '#c4baff' : '#d0cff0', fontWeight: isActive ? 600 : 400, fontSize: 13 }}>
                    {item.label}
                  </div>
                  <div style={{ color: '#8b8aaa', fontSize: 11, marginTop: 1 }}>{item.sub}</div>
                </div>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User */}
      {user && (
        <div style={{ padding: '12px 10px 20px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 12px', borderRadius: 12,
            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
          }}>
            <div style={{
              width: 32, height: 32, borderRadius: 10,
              background: 'linear-gradient(135deg, #7c6af5, #e879a0)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontSize: 13, fontWeight: 700, flexShrink: 0,
            }}>
              {(user.displayName?.[0] ?? user.email?.[0] ?? '?').toUpperCase()}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ color: '#f0eeff', fontSize: 12, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user.displayName ?? user.email}
              </div>
              <button
                onClick={logout}
                style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: '#8b8aaa', fontSize: 11, marginTop: 1 }}
                onMouseEnter={e => e.currentTarget.style.color = '#e879a0'}
                onMouseLeave={e => e.currentTarget.style.color = '#8b8aaa'}
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
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Sidebar />
      <main style={{ flex: 1, overflowY: 'auto', padding: '28px 28px 28px 24px' }}>
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
