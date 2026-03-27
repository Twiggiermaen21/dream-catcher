import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import Dashboard from './pages/Dashboard/Dashboard';
import Journal   from './pages/Journal/Journal';
import NewEntry  from './pages/NewEntry/NewEntry';
import Insights  from './pages/Insights/Insights';

const navStyle = ({ isActive }) => ({
  padding: '8px 16px',
  textDecoration: 'none',
  color: isActive ? '#6f42c1' : '#6c757d',
  fontWeight: isActive ? 700 : 400,
  borderBottom: isActive ? '2px solid #6f42c1' : '2px solid transparent',
});

function App() {
  return (
    <BrowserRouter>
      <nav style={{
        display: 'flex',
        gap: 4,
        padding: '12px 24px',
        borderBottom: '1px solid #dee2e6',
        background: '#fff',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        alignItems: 'center',
      }}>
        <span style={{ fontWeight: 800, fontSize: 20, marginRight: 24 }}>🌙 Dream Catcher</span>
        <NavLink to="/"          style={navStyle}>Dashboard</NavLink>
        <NavLink to="/journal"   style={navStyle}>Dziennik</NavLink>
        <NavLink to="/new-entry" style={navStyle}>+ Nowy wpis</NavLink>
        <NavLink to="/insights"  style={navStyle}>Insights</NavLink>
      </nav>

      <main style={{ minHeight: 'calc(100vh - 56px)', background: '#f8f9fa' }}>
        <Routes>
          <Route path="/"          element={<Dashboard />} />
          <Route path="/journal"   element={<Journal />} />
          <Route path="/new-entry" element={<NewEntry />} />
          <Route path="/insights"  element={<Insights />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default App
