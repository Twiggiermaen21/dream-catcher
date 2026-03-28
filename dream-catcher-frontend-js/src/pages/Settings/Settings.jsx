import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { settingsApi } from '../../api/settingsApi';

const labelCls = 'text-[11px] font-bold text-muted uppercase tracking-wider mb-2 block px-1';
const inputCls = 'w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-muted/50 focus:outline-none focus:border-accent/50 transition-colors';

function StatusBanner({ type, message }) {
  const colors = {
    success: 'bg-green-500/10 border-green-500/30 text-green-300',
    error:   'bg-red-500/10  border-red-500/30  text-red-300',
    pending: 'bg-accent/10  border-accent/30   text-accent',
  };
  return (
    <div className={`rounded-2xl border px-4 py-3 text-sm font-medium ${colors[type]}`}>
      {message}
    </div>
  );
}

function SectionCard({ title, icon, children }) {
  return (
    <div className="glass rounded-3xl overflow-hidden">
      <div className="px-8 py-5 border-b border-white/5 flex items-center gap-3">
        <span className="text-xl">{icon}</span>
        <span className="text-white font-bold text-base tracking-tight">{title}</span>
      </div>
      <div className="px-8 py-7 flex flex-col gap-5">
        {children}
      </div>
    </div>
  );
}

function SubmitButton({ loading, label, loadingLabel }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="w-full py-3 rounded-xl bg-accent/20 border border-accent/40 text-white text-sm font-bold tracking-wide hover:bg-accent/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
    >
      {loading ? loadingLabel : label}
    </button>
  );
}

export default function Settings() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [emailForm, setEmailForm]       = useState({ newEmail: '' });
  const [emailStatus, setEmailStatus]   = useState(null); // { type, message }
  const [emailLoading, setEmailLoading] = useState(false);

  const [passForm, setPassForm]         = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [passStatus, setPassStatus]     = useState(null);
  const [passLoading, setPassLoading]   = useState(false);

  // Handle redirect back from confirmation link
  useEffect(() => {
    const changed = searchParams.get('changed');
    const error   = searchParams.get('error');

    if (changed === 'email')
      setEmailStatus({ type: 'success', message: 'Adres e-mail został pomyślnie zmieniony.' });
    else if (changed === 'password')
      setPassStatus({ type: 'success', message: 'Hasło zostało pomyślnie zmienione.' });
    else if (error === 'expired')
      setEmailStatus({ type: 'error', message: 'Link potwierdzający wygasł. Spróbuj ponownie.' });

    if (changed || error) setSearchParams({}, { replace: true });
  }, []);

  const handleEmailChange = async (e) => {
    e.preventDefault();
    setEmailLoading(true);
    setEmailStatus(null);
    try {
      await settingsApi.requestEmailChange(emailForm.newEmail);
      setEmailStatus({
        type: 'pending',
        message: 'Link potwierdzający wysłany na Twój obecny adres e-mail. Ważny przez 5 minut.',
      });
      setEmailForm({ newEmail: '' });
    } catch (err) {
      const msg = err.response?.data?.message ?? 'Wystąpił błąd. Spróbuj ponownie.';
      setEmailStatus({ type: 'error', message: msg });
    } finally {
      setEmailLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passForm.newPassword !== passForm.confirmPassword) {
      setPassStatus({ type: 'error', message: 'Nowe hasła nie są identyczne.' });
      return;
    }
    if (passForm.newPassword.length < 8) {
      setPassStatus({ type: 'error', message: 'Nowe hasło musi mieć co najmniej 8 znaków.' });
      return;
    }
    setPassLoading(true);
    setPassStatus(null);
    try {
      await settingsApi.requestPasswordChange(passForm.currentPassword, passForm.newPassword);
      setPassStatus({
        type: 'pending',
        message: 'Link potwierdzający wysłany na Twój adres e-mail. Ważny przez 5 minut.',
      });
      setPassForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      const msg = err.response?.status === 401
        ? 'Obecne hasło jest nieprawidłowe.'
        : err.response?.data?.message ?? 'Wystąpił błąd. Spróbuj ponownie.';
      setPassStatus({ type: 'error', message: msg });
    } finally {
      setPassLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto flex flex-col gap-6">

      {/* Header */}
      <div>
        <div className="text-white text-xs font-bold uppercase tracking-widest opacity-60 mb-1">
          Konto
        </div>
        <div className="text-white text-2xl font-black">Ustawienia</div>
      </div>

      {/* Email change */}
      <SectionCard title="Zmiana adresu e-mail" icon="✉️">
        {emailStatus && <StatusBanner {...emailStatus} />}
        <form onSubmit={handleEmailChange} className="flex flex-col gap-5">
          <div>
            <label className={labelCls}>Nowy adres e-mail</label>
            <input
              type="email"
              required
              placeholder="nowy@email.com"
              value={emailForm.newEmail}
              onChange={e => setEmailForm({ newEmail: e.target.value })}
              className={inputCls}
            />
          </div>
          <SubmitButton loading={emailLoading} label="Wyślij link potwierdzający" loadingLabel="Wysyłanie…" />
        </form>
      </SectionCard>

      {/* Password change */}
      <SectionCard title="Zmiana hasła" icon="🔒">
        {passStatus && <StatusBanner {...passStatus} />}
        <form onSubmit={handlePasswordChange} className="flex flex-col gap-5">
          <div>
            <label className={labelCls}>Obecne hasło</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={passForm.currentPassword}
              onChange={e => setPassForm(f => ({ ...f, currentPassword: e.target.value }))}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Nowe hasło</label>
            <input
              type="password"
              required
              placeholder="min. 8 znaków"
              value={passForm.newPassword}
              onChange={e => setPassForm(f => ({ ...f, newPassword: e.target.value }))}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Potwierdź nowe hasło</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={passForm.confirmPassword}
              onChange={e => setPassForm(f => ({ ...f, confirmPassword: e.target.value }))}
              className={inputCls}
            />
          </div>
          <SubmitButton loading={passLoading} label="Wyślij link potwierdzający" loadingLabel="Wysyłanie…" />
        </form>
      </SectionCard>

    </div>
  );
}
