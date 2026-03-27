import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useJournalStore }  from '../../store/journalStore';
import { useDailyContext }  from '../../hooks/useDailyContext';
import MoonPhaseIcon        from '../../components/common/MoonPhaseIcon/MoonPhaseIcon';
import WeatherBadge         from '../../components/common/WeatherBadge/WeatherBadge';

const ZODIAC_SIGN = 'aries'; // docelowo z profilu użytkownika

export default function Dashboard() {
  const { sleepLogs, moodLogs, dreamLogs, fetchAll, loading } = useJournalStore();
  const { context, loading: ctxLoading } = useDailyContext(ZODIAC_SIGN);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const avgSleep = sleepLogs.length
    ? (sleepLogs.reduce((s, l) => s + l.sleepQualityRating, 0) / sleepLogs.length).toFixed(1)
    : '—';

  return (
    <div style={{ padding: 24, maxWidth: 900, margin: '0 auto' }}>
      <h1>🌙 Dream Catcher</h1>
      <p style={{ color: '#6c757d' }}>Twój holistyczny dziennik snu i marzeń</p>

      {/* Kontekst środowiskowy dnia */}
      <section style={{ marginBottom: 32 }}>
        <h2>Dziś</h2>
        {ctxLoading ? (
          <p>Pobieranie danych środowiskowych…</p>
        ) : context ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <WeatherBadge weatherData={context.weatherData} />
            <MoonPhaseIcon
              phase={context.moonData.phase}
              illumination={context.moonData.illuminationPercent}
            />
            {context.zodiacHoroscope && (
              <blockquote style={{
                borderLeft: '3px solid #6f42c1',
                paddingLeft: 16,
                color: '#555',
                fontStyle: 'italic',
              }}>
                {context.zodiacHoroscope}
              </blockquote>
            )}
          </div>
        ) : null}
      </section>

      {/* Statystyki */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 32 }}>
        <StatCard icon="😴" label="Wpisy snu"    value={sleepLogs.length} />
        <StatCard icon="🌈" label="Wpisy nastroju" value={moodLogs.length} />
        <StatCard icon="🌙" label="Sny"           value={dreamLogs.length} />
      </section>

      <div style={{ display: 'flex', gap: 12 }}>
        <Link to="/new-entry" style={btnStyle('#6f42c1')}>+ Nowy wpis</Link>
        <Link to="/insights"  style={btnStyle('#20c997')}>📊 Insights</Link>
        <Link to="/journal"   style={btnStyle('#6c757d')}>📖 Dziennik</Link>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }) {
  return (
    <div style={{
      padding: 20, borderRadius: 12, background: '#f8f9fa',
      border: '1px solid #dee2e6', textAlign: 'center',
    }}>
      <div style={{ fontSize: 32 }}>{icon}</div>
      <div style={{ fontSize: 28, fontWeight: 700 }}>{value}</div>
      <div style={{ color: '#6c757d', fontSize: 14 }}>{label}</div>
    </div>
  );
}

function btnStyle(bg) {
  return {
    padding: '10px 20px',
    background: bg,
    color: '#fff',
    borderRadius: 8,
    textDecoration: 'none',
    fontSize: 15,
    fontWeight: 600,
  };
}
