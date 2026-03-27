import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

export default function Login() {
  const [mode, setMode]     = useState('login');
  const [form, setForm]     = useState({ email: '', password: '', displayName: '' });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuthStore();
  const navigate = useNavigate();

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
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: '#edeae4' }}>
      <div className="w-full max-w-sm">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🌙</div>
          <h1 className="text-2xl font-bold text-gray-900">Dream Catcher</h1>
          <p className="text-sm text-gray-500 mt-1">Twój holistyczny dziennik snu i marzeń</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">

          {/* Tabs */}
          <div className="flex border-b border-gray-100">
            {[['login','Logowanie'],['register','Rejestracja']].map(([key, label]) => (
              <button key={key} onClick={() => { setMode(key); setError(''); }}
                className={`flex-1 py-3.5 text-sm border-none cursor-pointer transition-colors bg-transparent
                  ${mode === key
                    ? 'font-semibold text-gray-900 border-b-2 border-gray-900'
                    : 'text-gray-400 hover:text-gray-600'}`}>
                {label}
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">

            {mode === 'register' && (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-gray-500">Imię / Nick</label>
                <input
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:border-violet-500 transition-colors"
                  type="text" placeholder="Jak mamy się do Ciebie zwracać?"
                  value={form.displayName} onChange={e => set('displayName', e.target.value)} required />
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-500">E-mail</label>
              <input
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:border-violet-500 transition-colors"
                type="email" placeholder="twoj@email.com"
                value={form.email} onChange={e => set('email', e.target.value)} required />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-500">Hasło</label>
              <input
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:border-violet-500 transition-colors"
                type="password" placeholder={mode === 'register' ? 'Minimum 6 znaków' : '••••••••'}
                value={form.password} onChange={e => set('password', e.target.value)}
                required minLength={mode === 'register' ? 6 : undefined} />
            </div>

            {error && (
              <div className="px-3.5 py-2.5 bg-red-50 border border-red-100 rounded-lg text-sm text-red-600">
                {error}
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full py-3 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer border-none mt-1">
              {loading ? 'Ładowanie…' : mode === 'login' ? 'Zaloguj się' : 'Utwórz konto'}
            </button>

            {mode === 'login' && (
              <p className="text-center text-xs text-gray-400 leading-relaxed">
                Konto demo:<br />
                <span className="text-gray-500">user@dreamcatcher.app</span> / <span className="text-gray-500">User1234!</span>
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
