import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useJournalStore } from '../../store/journalStore';
import { useDailyContext }  from '../../hooks/useDailyContext';

const MOON_EMOJI  = { NEW_MOON:'🌑',WAXING_CRESCENT:'🌒',FIRST_QUARTER:'🌓',WAXING_GIBBOUS:'🌔',FULL_MOON:'🌕',WANING_GIBBOUS:'🌖',LAST_QUARTER:'🌗',WANING_CRESCENT:'🌘' };
const MOON_LABEL  = { NEW_MOON:'Nów',WAXING_CRESCENT:'Sierp ros.',FIRST_QUARTER:'I kwadra',WAXING_GIBBOUS:'Garb ros.',FULL_MOON:'Pełnia',WANING_GIBBOUS:'Garb mal.',LAST_QUARTER:'III kwadra',WANING_CRESCENT:'Sierp mal.' };

const card = { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', backdropFilter: 'blur(12px)' };
const divider = { borderBottom: '1px solid rgba(255,255,255,0.06)' };

const STATS = [
  { key: 'sleepLogs', icon: '😴', label: 'Wpisy snu',  gradient: 'linear-gradient(135deg, rgba(124,106,245,0.2), rgba(124,106,245,0.05))', accent: '#c4baff' },
  { key: 'moodLogs',  icon: '🌈', label: 'Nastroje',   gradient: 'linear-gradient(135deg, rgba(34,211,238,0.2), rgba(34,211,238,0.05))',  accent: '#67e8f9' },
  { key: 'dreamLogs', icon: '🌙', label: 'Sny',        gradient: 'linear-gradient(135deg, rgba(244,168,50,0.2),  rgba(244,168,50,0.05))',  accent: '#fcd34d' },
];

const ACTIONS = [
  { to: '/new-entry', icon: '😴', label: 'Dodaj wpis snu',      sub: 'Zapisz jakość snu tej nocy',    color: '#7c6af5' },
  { to: '/new-entry', icon: '🌈', label: 'Dodaj nastrój',       sub: 'Jak się dziś czujesz?',          color: '#22d3ee' },
  { to: '/new-entry', icon: '🌙', label: 'Opisz marzenie senne', sub: 'Zanim zapomnisz...',            color: '#f4a832' },
  { to: '/insights',  icon: '✧',  label: 'Zobacz Insights',      sub: 'Twoje korelacje i wzorce',       color: '#e879a0' },
];

export default function Dashboard() {
  const { sleepLogs, moodLogs, dreamLogs, fetchAll } = useJournalStore();
  const { context, loading: ctxLoading }             = useDailyContext();
  const counts = { sleepLogs: sleepLogs.length, moodLogs: moodLogs.length, dreamLogs: dreamLogs.length };

  useEffect(() => { fetchAll(); }, [fetchAll]);

  return (
    <div className="flex flex-col gap-4">

      {/* Kontekst dnia */}
      <div className="rounded-2xl overflow-hidden" style={card}>
        <div className="flex items-center justify-between px-5 py-4" style={divider}>
          <span className="font-semibold text-sm text-white">Dzisiejszy kontekst</span>
          <span className="text-xs" style={{ color: '#8b8aaa' }}>
            {new Date().toLocaleDateString('pl-PL', { weekday: 'long', day: 'numeric', month: 'long' })}
          </span>
        </div>

        {ctxLoading ? (
          <div className="px-5 py-4 text-sm" style={{ color: '#8b8aaa' }}>Pobieranie danych…</div>
        ) : context ? (
          <div className="grid grid-cols-4">
            {[
              { icon: '🌡️', label: 'Temperatura', value: `${context.weatherData?.temperatureCelsius?.toFixed(1)}°C` },
              { icon: '🔵', label: 'Ciśnienie',   value: `${context.weatherData?.pressureHpa?.toFixed(0)} hPa`, warn: context.weatherData?.pressureHpa < 1000 },
              { icon: '💧', label: 'Wilgotność',  value: `${context.weatherData?.humidity?.toFixed(0)}%` },
              { icon: MOON_EMOJI[context.moonData?.phase] ?? '🌙', label: 'Faza księżyca', value: MOON_LABEL[context.moonData?.phase] ?? '—' },
            ].map((t, i) => (
              <div key={i} className="px-5 py-4" style={i < 3 ? { borderRight: '1px solid rgba(255,255,255,0.06)' } : {}}>
                <div className="text-xl mb-1">{t.icon}</div>
                <div className="text-xs mb-0.5" style={{ color: '#8b8aaa' }}>{t.label}</div>
                <div className="text-sm font-semibold" style={{ color: t.warn ? '#f4a832' : '#f0eeff' }}>{t.value}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-5 py-4 text-sm" style={{ color: '#8b8aaa' }}>Brak danych środowiskowych</div>
        )}
      </div>

      {/* Statystyki */}
      <div className="grid grid-cols-3 gap-3">
        {STATS.map(s => (
          <div key={s.key} className="rounded-2xl p-5" style={card}>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-3"
              style={{ background: s.gradient }}>
              {s.icon}
            </div>
            <div className="text-3xl font-bold leading-none" style={{ color: s.accent }}>{counts[s.key]}</div>
            <div className="text-xs mt-1.5" style={{ color: '#8b8aaa' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="rounded-2xl overflow-hidden" style={card}>
        <div className="px-5 py-4 font-semibold text-sm text-white" style={divider}>Szybkie akcje</div>
        {ACTIONS.map((a, i) => (
          <Link key={i} to={a.to}
            className="flex items-center gap-3.5 px-5 py-3.5 transition-all no-underline group"
            style={{ borderBottom: i < ACTIONS.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
              style={{ background: `${a.color}22` }}>
              {a.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-white">{a.label}</div>
              <div className="text-xs mt-0.5" style={{ color: '#8b8aaa' }}>{a.sub}</div>
            </div>
            <span className="text-lg" style={{ color: '#2a2b45' }}>›</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
