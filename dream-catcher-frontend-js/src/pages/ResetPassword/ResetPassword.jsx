import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { apiClient } from '../../api/client';

export default function ResetPassword() {
  const [searchParams]        = useSearchParams();
  const token                 = searchParams.get('token') ?? '';
  const [password, setPassword]   = useState('');
  const [confirm, setConfirm]     = useState('');
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');
  const [done, setDone]           = useState(false);
  const navigate                  = useNavigate();

  const handleSubmit = async e => {
    e.preventDefault();
    if (password !== confirm) { setError('Hasła nie są identyczne'); return; }
    setError(''); setLoading(true);
    try {
      await apiClient.post('/api/v1/auth/reset-password', { token, newPassword: password });
      setDone(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.message ?? 'Nieprawidłowy lub wygasły link');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-page">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink/15 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-sm relative z-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-white/5 border border-white/10 shadow-2xl mb-6">
            <span className="text-5xl drop-shadow-glow-purple">🔑</span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tighter mb-2">Nowe hasło</h1>
          <p className="text-muted text-sm">Dream Catcher</p>
        </div>

        <div className="glass rounded-3xl overflow-hidden shadow-2xl border-white/10 p-8">
          {done ? (
            <div className="flex flex-col items-center gap-4 py-4">
              <span className="text-4xl">✓</span>
              <p className="text-accent font-bold text-center">Hasło zostało zmienione!</p>
              <p className="text-muted text-xs text-center">Przekierowujemy do logowania…</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-bold text-muted uppercase tracking-wider px-1">Nowe hasło</label>
                <input
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all text-white placeholder-muted/50 bg-white/5 border border-white/10 focus:border-accent/50 focus:bg-white/10 focus:ring-1 focus:ring-accent/20 font-medium"
                  type="password" placeholder="Minimum 6 znaków"
                  value={password} onChange={e => setPassword(e.target.value)}
                  required minLength={6} />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-bold text-muted uppercase tracking-wider px-1">Powtórz hasło</label>
                <input
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all text-white placeholder-muted/50 bg-white/5 border border-white/10 focus:border-accent/50 focus:bg-white/10 focus:ring-1 focus:ring-accent/20 font-medium"
                  type="password" placeholder="••••••••"
                  value={confirm} onChange={e => setConfirm(e.target.value)}
                  required minLength={6} />
              </div>

              {error && (
                <div className="px-4 py-3 rounded-xl text-xs font-bold bg-pink/10 border border-pink/20 text-pink text-center">
                  {error}
                </div>
              )}

              <button type="submit" disabled={loading || !token}
                className="w-full py-4 text-sm font-black rounded-2xl transition-all cursor-pointer border-none text-white bg-linear-to-r from-accent to-[#5b4bc4] shadow-[0_8px_30px_rgba(124,106,245,0.4)] hover:shadow-[0_12px_40px_rgba(124,106,245,0.5)] hover:-translate-y-1 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest">
                {loading ? 'Zapisywanie…' : 'Ustaw nowe hasło'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
