import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useJournalStore } from '../../store/journalStore';
import { useDailyContext } from '../../hooks/useDailyContext';
import MoonPhaseIcon  from '../../components/common/MoonPhaseIcon/MoonPhaseIcon';
import WeatherBadge   from '../../components/common/WeatherBadge/WeatherBadge';

const STAT_CARDS = [
  { icon: '😴', bg: '#f0eeff', label: 'Wpisy snu',    key: 'sleepLogs' },
  { icon: '🌈', bg: '#eefff4', label: 'Nastroje',     key: 'moodLogs' },
  { icon: '🌙', bg: '#fff8ee', label: 'Sny',          key: 'dreamLogs' },
];

export default function Dashboard() {
  const { sleepLogs, moodLogs, dreamLogs, fetchAll, loading } = useJournalStore();
  const { context, loading: ctxLoading } = useDailyContext();

  const counts = { sleepLogs: sleepLogs.length, moodLogs: moodLogs.length, dreamLogs: dreamLogs.length };

  useEffect(() => { fetchAll(); }, [fetchAll]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Kontekst dnia */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontWeight: 600, fontSize: 15 }}>Dzisiejszy kontekst</span>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            {new Date().toLocaleDateString('pl-PL', { weekday: 'long', day: 'numeric', month: 'long' })}
          </span>
        </div>

        {ctxLoading ? (
          <div style={{ padding: 20, color: 'var(--text-muted)', fontSize: 13 }}>Pobieranie danych…</div>
        ) : context ? (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 0 }}>
            <ContextTile icon="🌡️" label="Temperatura" value={`${context.weatherData?.temperatureCelsius?.toFixed(1)}°C`} />
            <ContextTile
              icon="🔵"
              label="Ciśnienie"
              value={`${context.weatherData?.pressureHpa?.toFixed(0)} hPa`}
              highlight={context.weatherData?.pressureHpa < 1000}
            />
            <ContextTile icon="💧" label="Wilgotność" value={`${context.weatherData?.humidity?.toFixed(0)}%`} />
            <ContextTile icon={moonEmoji(context.moonData?.phase)} label="Faza księżyca" value={moonLabel(context.moonData?.phase)} />
          </div>
        ) : (
          <div style={{ padding: 20, color: 'var(--text-muted)', fontSize: 13 }}>Brak danych środowiskowych</div>
        )}
      </div>

      {/* Statystyki */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
        {STAT_CARDS.map(s => (
          <div key={s.key} className="card" style={{ padding: '20px 20px' }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, marginBottom: 12 }}>
              {s.icon}
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, lineHeight: 1 }}>{counts[s.key]}</div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', fontWeight: 600, fontSize: 15 }}>
          Szybkie akcje
        </div>
        {[
          { to: '/new-entry', icon: '😴', label: 'Dodaj wpis snu',     sub: 'Zapisz jakość snu tej nocy' },
          { to: '/new-entry', icon: '🌈', label: 'Dodaj nastrój',       sub: 'Jak się dziś czujesz?' },
          { to: '/new-entry', icon: '🌙', label: 'Opisz marzenie senne', sub: 'Zanim zapomnisz...' },
          { to: '/insights',  icon: '📊', label: 'Zobacz Insights',      sub: 'Twoje korelacje i wzorce' },
        ].map((item, i) => (
          <Link key={i} to={item.to} style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="list-item">
              <div className="list-icon" style={{ background: 'var(--bg-hover)' }}>{item.icon}</div>
              <div>
                <div style={{ fontWeight: 500, fontSize: 14 }}>{item.label}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{item.sub}</div>
              </div>
              <div style={{ marginLeft: 'auto', color: 'var(--text-muted)', fontSize: 18 }}>›</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function ContextTile({ icon, label, value, highlight }) {
  return (
    <div style={{
      flex: '1 1 120px',
      padding: '16px 20px',
      borderRight: '1px solid var(--border)',
      borderBottom: '1px solid var(--border)',
    }}>
      <div style={{ fontSize: 20, marginBottom: 6 }}>{icon}</div>
      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 2 }}>{label}</div>
      <div style={{ fontWeight: 600, fontSize: 15, color: highlight ? '#d97706' : 'var(--text-primary)' }}>{value}</div>
    </div>
  );
}

const MOON_EMOJI = { NEW_MOON:'🌑', WAXING_CRESCENT:'🌒', FIRST_QUARTER:'🌓', WAXING_GIBBOUS:'🌔', FULL_MOON:'🌕', WANING_GIBBOUS:'🌖', LAST_QUARTER:'🌗', WANING_CRESCENT:'🌘' };
const MOON_LABEL = { NEW_MOON:'Nów', WAXING_CRESCENT:'Sierp ros.', FIRST_QUARTER:'I kwadra', WAXING_GIBBOUS:'Garb ros.', FULL_MOON:'Pełnia', WANING_GIBBOUS:'Garb mal.', LAST_QUARTER:'III kwadra', WANING_CRESCENT:'Sierp mal.' };
const moonEmoji = p => MOON_EMOJI[p] ?? '🌙';
const moonLabel = p => MOON_LABEL[p] ?? p;
