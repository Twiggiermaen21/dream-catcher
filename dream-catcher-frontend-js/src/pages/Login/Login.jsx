import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { apiClient } from '../../api/client';

function DarkInput({ type, placeholder, value, onChange, required, minLength }) {
  return (
    <input
      className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all text-white placeholder-muted/50 bg-white/5 border border-white/10 focus:border-accent/50 focus:bg-white/10 focus:ring-1 focus:ring-accent/20 font-medium"
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      required={required}
      minLength={minLength}
    />
  );
}

export default function Login() {
  const [mode, setMode]                   = useState('login');
  const [form, setForm]                   = useState({ email: '', password: '', displayName: '' });
  const [error, setError]                 = useState('');
  const [loading, setLoading]             = useState(false);
  const [forgotOpen, setForgotOpen]       = useState(false);
  const [forgotEmail, setForgotEmail]     = useState('');
  const [forgotSent, setForgotSent]       = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const { login, register }               = useAuthStore();
  const navigate                          = useNavigate();

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

  const handleForgot = async e => {
    e.preventDefault();
    setForgotLoading(true);
    try {
      await apiClient.post('/api/v1/auth/forgot-password', { email: forgotEmail });
      setForgotSent(true);
    } catch {
      setForgotSent(true); // nie ujawniamy czy email istnieje
    } finally { setForgotLoading(false); }
  };

  const openForgot = () => { setForgotOpen(true); setError(''); };
  const closeForgot = () => { setForgotOpen(false); setForgotSent(false); setForgotEmail(''); };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-page">
      {/* Dynamic Background elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink/15 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-sm relative z-10">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-white/5 border border-white/10 shadow-2xl mb-6 relative group overflow-hidden">
            <div className="absolute inset-0 bg-linear-to-br from-accent/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <span className="text-5xl drop-shadow-glow-purple group-hover:scale-110 transition-transform">🌙</span>
          </div>
          <h1 className="text-4xl font-black text-white tracking-tighter mb-2">Dream Catcher</h1>
          <p className="text-muted text-sm font-medium opacity-80 uppercase tracking-widest text-[10px]">Twój holistyczny dziennik snu i marzeń</p>
        </div>

        {/* Card */}
        <div className="glass rounded-3xl overflow-hidden shadow-2xl border-white/10">

          {forgotOpen ? (
            /* ── Widok reset hasła ── */
            <div className="p-8 flex flex-col gap-6">
              <div className="flex items-center gap-3">
                <button type="button" onClick={closeForgot}
                  className="text-muted hover:text-white transition-colors bg-transparent border-none cursor-pointer text-lg leading-none">
                  ←
                </button>
                <p className="text-[11px] uppercase font-bold tracking-widest text-muted">
                  Przypomnij hasło
                </p>
              </div>

              {forgotSent ? (
                <p className="text-center text-sm text-accent font-semibold py-4">
                  Jeśli konto istnieje, wysłaliśmy link na podany adres.
                </p>
              ) : (
                <form onSubmit={handleForgot} className="flex flex-col gap-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-[11px] font-bold text-muted uppercase tracking-wider px-1">E-mail</label>
                    <DarkInput type="email" placeholder="twoj@email.com"
                      value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} required />
                  </div>
                  <button type="submit" disabled={forgotLoading}
                    className="w-full py-4 text-sm font-black rounded-2xl transition-all cursor-pointer border-none text-white bg-linear-to-r from-accent to-[#5b4bc4] shadow-[0_8px_30px_rgba(124,106,245,0.4)] hover:shadow-[0_12px_40px_rgba(124,106,245,0.5)] hover:-translate-y-1 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest">
                    {forgotLoading ? 'Wysyłanie…' : 'Wyślij link'}
                  </button>
                </form>
              )}
            </div>
          ) : (
            /* ── Widok logowania / rejestracji ── */
            <>
              {/* Tabs */}
              <div className="flex bg-white/2 border-b border-white/5">
                {[
                  { key: 'login', label: 'Logowanie' },
                  { key: 'register', label: 'Rejestracja' }
                ].map((tab) => (
                  <button key={tab.key} onClick={() => { setMode(tab.key); setError(''); }}
                    className={`
                      flex-1 py-4 text-sm font-bold tracking-wide border-none cursor-pointer transition-all bg-transparent relative
                      ${mode === tab.key ? 'text-white' : 'text-muted hover:text-white/70'}
                    `}>
                    {tab.label}
                    {mode === tab.key && (
                      <div className="absolute bottom-0 left-8 right-8 h-1 bg-accent shadow-glow-purple rounded-full"></div>
                    )}
                  </button>
                ))}
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-8 flex flex-col gap-6">

                {mode === 'register' && (
                  <div className="flex flex-col gap-2">
                    <label className="text-[11px] font-bold text-muted uppercase tracking-wider px-1">Imię / Nick</label>
                    <DarkInput type="text" placeholder="Jak mamy się do Ciebie zwracać?"
                      value={form.displayName} onChange={e => set('displayName', e.target.value)} required />
                  </div>
                )}

                <div className="flex flex-col gap-2">
                  <label className="text-[11px] font-bold text-muted uppercase tracking-wider px-1">E-mail</label>
                  <DarkInput type="email" placeholder="twoj@email.com"
                    value={form.email} onChange={e => set('email', e.target.value)} required />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[11px] font-bold text-muted uppercase tracking-wider px-1">Hasło</label>
                  <DarkInput type="password"
                    placeholder={mode === 'register' ? 'Minimum 6 znaków' : '••••••••'}
                    value={form.password} onChange={e => set('password', e.target.value)}
                    required minLength={mode === 'register' ? 6 : undefined} />
                </div>

                {error && (
                  <div className="px-4 py-3 rounded-xl text-xs font-bold bg-pink/10 border border-pink/20 text-pink text-center animate-shake">
                    {error}
                  </div>
                )}

                <button type="submit" disabled={loading}
                  className="w-full py-4 text-sm font-black rounded-2xl transition-all cursor-pointer border-none mt-2 text-white bg-linear-to-r from-accent to-[#5b4bc4] shadow-[0_8px_30px_rgba(124,106,245,0.4)] hover:shadow-[0_12px_40px_rgba(124,106,245,0.5)] hover:-translate-y-1 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest">
                  {loading ? 'Uwierzytelnianie…' : mode === 'login' ? 'Zaloguj się' : 'Utwórz konto'}
                </button>

                {mode === 'login' && (
                  <button type="button" onClick={openForgot}
                    className="w-full text-center text-[11px] text-muted hover:text-accent transition-colors bg-transparent border-none cursor-pointer py-1">
                    Nie pamiętasz hasła?
                  </button>
                )}

              </form>
            </>
          )}
        </div>

        <p className="text-center mt-10 text-[10px] font-bold text-muted/40 uppercase tracking-[0.2em]">
          DREAM CATCHER · Holistics v4
        </p>
      </div>
    </div>
  );
}
