import { useEffect, useState } from 'react';
import { useJournalStore } from '../../store/journalStore';
import MoonPhaseIcon from '../../components/common/MoonPhaseIcon/MoonPhaseIcon';

const TABS = [
  { key: 'sleep', label: '😴 Sen' },
  { key: 'mood',  label: '🌈 Nastrój' },
  { key: 'dream', label: '🌙 Sny' },
];

export default function Journal() {
  const { sleepLogs, moodLogs, dreamLogs, fetchAll, loading } = useJournalStore();
  const [activeTab, setActiveTab] = useState('sleep');

  useEffect(() => { fetchAll(); }, [fetchAll]);

  return (
    <div style={{ padding: 24, maxWidth: 900, margin: '0 auto' }}>
      <h2>📖 Dziennik</h2>

      <div style={{ display: 'flex', gap: 0, marginBottom: 24, borderBottom: '2px solid #dee2e6' }}>
        {TABS.map((tab) => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
            padding: '10px 20px', border: 'none', background: 'transparent',
            borderBottom: activeTab === tab.key ? '2px solid #6f42c1' : '2px solid transparent',
            fontWeight: activeTab === tab.key ? 700 : 400,
            color: activeTab === tab.key ? '#6f42c1' : '#6c757d',
            cursor: 'pointer', fontSize: 15, marginBottom: -2,
          }}>
            {tab.label}
          </button>
        ))}
      </div>

      {loading && <p>Ładowanie…</p>}

      {activeTab === 'sleep' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {sleepLogs.length === 0 && !loading && <p style={{ color: '#6c757d' }}>Brak wpisów snu.</p>}
          {sleepLogs.map((log) => (
            <div key={log.id} style={cardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <strong>{log.date}</strong>
                <span style={{ color: '#6f42c1', fontWeight: 700 }}>
                  {log.sleepQualityRating}/10
                </span>
              </div>
              <div style={{ fontSize: 14, color: '#6c757d', marginTop: 4 }}>
                🛌 {log.bedtime} → ☀️ {log.wakeTime}
                {log.hadNightmares && ' · 😱 Koszmary'}
              </div>
              {log.eveningRituals?.length > 0 && (
                <div style={{ fontSize: 12, marginTop: 4 }}>
                  Rytuały: {log.eveningRituals.join(', ')}
                </div>
              )}
              {log.environmentalContext && (
                <div style={{ marginTop: 8 }}>
                  <MoonPhaseIcon
                    phase={log.environmentalContext.moonData.phase}
                    illumination={log.environmentalContext.moonData.illuminationPercent}
                    size={20}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {activeTab === 'mood' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {moodLogs.length === 0 && !loading && <p style={{ color: '#6c757d' }}>Brak wpisów nastroju.</p>}
          {moodLogs.map((log) => (
            <div key={log.id} style={cardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <strong>{log.date}</strong>
                <span>⚡ {log.energyLevel}/10 · 🔥 stres {log.stressLevel}/10</span>
              </div>
              <div style={{ fontSize: 14, marginTop: 4 }}>
                Rano: <strong>{log.morningMood}</strong> → Wieczór: <strong>{log.eveningMood}</strong>
              </div>
              {log.notes && <p style={{ fontSize: 13, color: '#555', marginTop: 6 }}>{log.notes}</p>}
            </div>
          ))}
        </div>
      )}

      {activeTab === 'dream' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {dreamLogs.length === 0 && !loading && <p style={{ color: '#6c757d' }}>Brak wpisów snów.</p>}
          {dreamLogs.map((log) => (
            <div key={log.id} style={cardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <strong>{log.date}</strong>
                <span>
                  {log.clarity} · {log.sentiment}
                  {log.isRecurring && ' · 🔁 Powracający'}
                </span>
              </div>
              <p style={{ fontSize: 14, marginTop: 6, color: '#333' }}>
                {log.dreamDescription?.slice(0, 200)}
                {log.dreamDescription?.length > 200 ? '…' : ''}
              </p>
              {log.symbols?.length > 0 && (
                <div style={{ fontSize: 12, color: '#6c757d' }}>
                  Symbole: {log.symbols.join(', ')}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const cardStyle = {
  padding: 16,
  borderRadius: 10,
  border: '1px solid #dee2e6',
  background: '#fff',
};
