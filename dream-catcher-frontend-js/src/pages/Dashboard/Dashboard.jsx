import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useJournalStore } from '../../store/journalStore';
import { useDailyContext }  from '../../hooks/useDailyContext';

const MOON_EMOJI  = { NEW_MOON:'🌑',WAXING_CRESCENT:'🌒',FIRST_QUARTER:'🌓',WAXING_GIBBOUS:'🌔',FULL_MOON:'🌕',WANING_GIBBOUS:'🌖',LAST_QUARTER:'🌗',WANING_CRESCENT:'🌘' };
const MOON_LABEL  = { NEW_MOON:'Nów',WAXING_CRESCENT:'Sierp ros.',FIRST_QUARTER:'I kwadra',WAXING_GIBBOUS:'Garb ros.',FULL_MOON:'Pełnia',WANING_GIBBOUS:'Garb mal.',LAST_QUARTER:'III kwadra',WANING_CRESCENT:'Sierp mal.' };

const STATS = [
  { key: 'sleepLogs', icon: '😴', label: 'Wpisy snu',  bg: 'bg-violet-50' },
  { key: 'moodLogs',  icon: '🌈', label: 'Nastroje',   bg: 'bg-emerald-50' },
  { key: 'dreamLogs', icon: '🌙', label: 'Sny',        bg: 'bg-amber-50' },
];

const ACTIONS = [
  { to: '/new-entry', icon: '😴', label: 'Dodaj wpis snu',      sub: 'Zapisz jakość snu tej nocy' },
  { to: '/new-entry', icon: '🌈', label: 'Dodaj nastrój',       sub: 'Jak się dziś czujesz?' },
  { to: '/new-entry', icon: '🌙', label: 'Opisz marzenie senne', sub: 'Zanim zapomnisz...' },
  { to: '/insights',  icon: '📊', label: 'Zobacz Insights',      sub: 'Twoje korelacje i wzorce' },
];

export default function Dashboard() {
  const { sleepLogs, moodLogs, dreamLogs, fetchAll } = useJournalStore();
  const { context, loading: ctxLoading }             = useDailyContext();
  const counts = { sleepLogs: sleepLogs.length, moodLogs: moodLogs.length, dreamLogs: dreamLogs.length };

  useEffect(() => { fetchAll(); }, [fetchAll]);

  return (
    <div className="flex flex-col gap-4">

      {/* Kontekst dnia */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <span className="font-semibold text-sm text-gray-900">Dzisiejszy kontekst</span>
          <span className="text-xs text-gray-400">
            {new Date().toLocaleDateString('pl-PL', { weekday: 'long', day: 'numeric', month: 'long' })}
          </span>
        </div>

        {ctxLoading ? (
          <div className="px-5 py-4 text-sm text-gray-400">Pobieranie danych…</div>
        ) : context ? (
          <div className="grid grid-cols-4">
            {[
              { icon: '🌡️', label: 'Temperatura', value: `${context.weatherData?.temperatureCelsius?.toFixed(1)}°C` },
              { icon: '🔵', label: 'Ciśnienie',   value: `${context.weatherData?.pressureHpa?.toFixed(0)} hPa`, warn: context.weatherData?.pressureHpa < 1000 },
              { icon: '💧', label: 'Wilgotność',  value: `${context.weatherData?.humidity?.toFixed(0)}%` },
              { icon: MOON_EMOJI[context.moonData?.phase] ?? '🌙', label: 'Faza księżyca', value: MOON_LABEL[context.moonData?.phase] ?? '—' },
            ].map((t, i) => (
              <div key={i} className={`px-5 py-4 ${i < 3 ? 'border-r border-gray-100' : ''}`}>
                <div className="text-lg mb-1">{t.icon}</div>
                <div className="text-xs text-gray-400 mb-0.5">{t.label}</div>
                <div className={`text-sm font-semibold ${t.warn ? 'text-amber-600' : 'text-gray-900'}`}>{t.value}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-5 py-4 text-sm text-gray-400">Brak danych środowiskowych</div>
        )}
      </div>

      {/* Statystyki */}
      <div className="grid grid-cols-3 gap-3">
        {STATS.map(s => (
          <div key={s.key} className="bg-white rounded-2xl shadow-sm p-5">
            <div className={`w-11 h-11 ${s.bg} rounded-xl flex items-center justify-center text-2xl mb-3`}>{s.icon}</div>
            <div className="text-3xl font-bold text-gray-900 leading-none">{counts[s.key]}</div>
            <div className="text-xs text-gray-400 mt-1.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 font-semibold text-sm text-gray-900">Szybkie akcje</div>
        {ACTIONS.map((a, i) => (
          <Link key={i} to={a.to} className="flex items-center gap-3.5 px-5 py-3.5 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-none no-underline">
            <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-xl shrink-0">{a.icon}</div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-gray-900">{a.label}</div>
              <div className="text-xs text-gray-400 mt-0.5">{a.sub}</div>
            </div>
            <span className="text-gray-300 text-lg">›</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
