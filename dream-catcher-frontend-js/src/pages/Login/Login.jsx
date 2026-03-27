import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

export default function Login() {
  const [mode, setMode] = useState('login');   // 'login' | 'register'
  const [form, setForm] = useState({ email: '', password: '', displayName: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuthStore();
  const navigate = useNavigate();

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(form.email, form.password);
      } else {
        await register(form.email, form.password, form.displayName);
      }
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message ?? 'Nieprawidłowe dane logowania');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-page)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
    }}>
      <div style={{ width: '100%', maxWidth: 420 }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🌙</div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
            Dream Catcher
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: 6, fontSize: 14 }}>
            Twój holistyczny dziennik snu i marzeń
          </p>
        </div>

        {/* Card */}
        <div className="card" style={{ overflow: 'hidden' }}>

          {/* Tabs */}
          <div style={{ display: 'flex', borderBottom: '1px solid var(--border)' }}>
            {[['login', 'Logowanie'], ['register', 'Rejestracja']].map(([key, label]) => (
              <button
                key={key}
                onClick={() => { setMode(key); setError(''); }}
                style={{
                  flex: 1,
                  padding: '14px 0',
                  border: 'none',
                  background: 'transparent',
                  fontSize: 14,
                  fontWeight: mode === key ? 600 : 400,
                  color: mode === key ? 'var(--text-primary)' : 'var(--text-muted)',
                  borderBottom: mode === key ? '2px solid var(--text-primary)' : '2px solid transparent',
                  cursor: 'pointer',
                  marginBottom: -1,
                  transition: 'color .15s',
                }}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>

            {mode === 'register' && (
              <label>
                Imię / Nick
                <input
                  className="input"
                  type="text"
                  placeholder="Jak mamy się do Ciebie zwracać?"
                  value={form.displayName}
                  onChange={e => set('displayName', e.target.value)}
                  required
                />
              </label>
            )}

            <label>
              E-mail
              <input
                className="input"
                type="email"
                placeholder="twoj@email.com"
                value={form.email}
                onChange={e => set('email', e.target.value)}
                required
              />
            </label>

            <label>
              Hasło
              <input
                className="input"
                type="password"
                placeholder={mode === 'register' ? 'Minimum 6 znaków' : '••••••••'}
                value={form.password}
                onChange={e => set('password', e.target.value)}
                required
                minLength={mode === 'register' ? 6 : undefined}
              />
            </label>

            {error && (
              <div style={{
                padding: '10px 14px',
                background: '#fff0f0',
                border: '1px solid #fecaca',
                borderRadius: 'var(--radius-sm)',
                fontSize: 13,
                color: '#dc2626',
              }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ width: '100%', justifyContent: 'center', padding: '12px 0', marginTop: 4 }}
            >
              {loading ? 'Ładowanie…' : mode === 'login' ? 'Zaloguj się' : 'Utwórz konto'}
            </button>

            {/* Demo hint */}
            {mode === 'login' && (
              <div style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6 }}>
                Konto demo:<br />
                <span style={{ color: 'var(--text-secondary)' }}>user@dreamcatcher.app</span>
                {' / '}
                <span style={{ color: 'var(--text-secondary)' }}>User1234!</span>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
