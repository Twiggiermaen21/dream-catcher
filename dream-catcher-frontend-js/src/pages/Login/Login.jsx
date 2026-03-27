import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

const inputCls = `w-full px-4 py-3 rounded-xl text-sm outline-none transition-all text-white placeholder-[#8b8aaa]`;
const inputStyle = {
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.1)',
};
const inputFocusStyle = {
  background: 'rgba(124,106,245,0.08)',
  border: '1px solid rgba(124,106,245,0.5)',
};

function DarkInput({ type, placeholder, value, onChange, required, minLength }) {
  const [focused, setFocused] = useState(false);
  return (
    <input
      className={inputCls}
      style={focused ? inputFocusStyle : inputStyle}
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      required={required}
      minLength={minLength}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    />
  );
}

export default function Login() {
  const [mode, setMode]       = useState('login');
  const [form, setForm]       = useState({ email: '', password: '', displayName: '' });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register }   = useAuthStore();
  const navigate              = useNavigate();

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async e => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      if (mode === 'login') await login(form.email, form.password);
      else await register(form.email, form.password, form.displayName);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message ?? 'Nieprawidłowe dane logowania');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-sm">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🌙</div>
          <h1 className="text-2xl font-bold text-white tracking-wide">Dream Catcher</h1>
          <p className="text-sm mt-2" style={{ color: '#8b8aaa' }}>Twój holistyczny dziennik snu i marzeń</p>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(16px)' }}
        >
          {/* Tabs */}
          <div className="flex" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            {[['login','Logowanie'],['register','Rejestracja']].map(([key, label]) => (
              <button key={key} onClick={() => { setMode(key); setError(''); }}
                className="flex-1 py-4 text-sm border-none cursor-pointer transition-all bg-transparent"
                style={mode === key
                  ? { color: '#c4baff', fontWeight: 600, borderBottom: '2px solid #7c6af5' }
                  : { color: '#8b8aaa' }
                }>
                {label}
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">

            {mode === 'register' && (
              <div className="flex flex-col gap-2">
                <label className="text-xs font-medium" style={{ color: '#8b8aaa' }}>Imię / Nick</label>
                <DarkInput type="text" placeholder="Jak mamy się do Ciebie zwracać?"
                  value={form.displayName} onChange={e => set('displayName', e.target.value)} required />
              </div>
            )}

            <div className="flex flex-col gap-2">
              <label className="text-xs font-medium" style={{ color: '#8b8aaa' }}>E-mail</label>
              <DarkInput type="email" placeholder="twoj@email.com"
                value={form.email} onChange={e => set('email', e.target.value)} required />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-medium" style={{ color: '#8b8aaa' }}>Hasło</label>
              <DarkInput type="password"
                placeholder={mode === 'register' ? 'Minimum 6 znaków' : '••••••••'}
                value={form.password} onChange={e => set('password', e.target.value)}
                required minLength={mode === 'register' ? 6 : undefined} />
            </div>

            {error && (
              <div className="px-4 py-3 rounded-xl text-sm"
                style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)', color: '#fca5a5' }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full py-3.5 text-sm font-semibold rounded-xl transition-all cursor-pointer border-none mt-1 text-white disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: 'linear-gradient(135deg, #7c6af5 0%, #5b4bc4 100%)', boxShadow: '0 4px 20px rgba(124,106,245,0.3)' }}>
              {loading ? 'Ładowanie…' : mode === 'login' ? 'Zaloguj się' : 'Utwórz konto'}
            </button>

            {mode === 'login' && (
              <p className="text-center text-xs leading-relaxed" style={{ color: '#8b8aaa' }}>
                Konto demo:<br />
                <span style={{ color: '#c4baff' }}>user@dreamcatcher.app</span> / <span style={{ color: '#c4baff' }}>User1234!</span>
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
