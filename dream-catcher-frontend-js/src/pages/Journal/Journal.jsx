import { useEffect, useState } from 'react';
import { useJournalStore } from '../../store/journalStore';

const TABS = [
  { key: 'sleep', icon: '😴', label: 'Sen' },
  { key: 'mood',  icon: '🌈', label: 'Nastrój' },
  { key: 'dream', icon: '🌙', label: 'Sny' },
];

const MOON_EMOJI = { NEW_MOON:'🌑', WAXING_CRESCENT:'🌒', FIRST_QUARTER:'🌓', WAXING_GIBBOUS:'🌔', FULL_MOON:'🌕', WANING_GIBBOUS:'🌖', LAST_QUARTER:'🌗', WANING_CRESCENT:'🌘' };

export default function Journal() {
  const { sleepLogs, moodLogs, dreamLogs, fetchAll, loading } = useJournalStore();
  const [activeTab, setActiveTab] = useState('sleep');
  const [search, setSearch] = useState('');

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const logs = { sleep: sleepLogs, mood: moodLogs, dream: dreamLogs }[activeTab];
  const filtered = logs.filter(l =>
    !search || JSON.stringify(l).toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="card" style={{ overflow: 'hidden' }}>

      {/* Search bar */}
      <div className="search-bar">
        <span className="search-icon">🔍</span>
        <input
          placeholder="Szukaj w dzienniku…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        {search && (
          <button onClick={() => setSearch('')} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 16 }}>✕</button>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', padding: '0 8px' }}>
        {TABS.map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '12px 14px', border: 'none', background: 'transparent',
            fontSize: 13, fontWeight: activeTab === tab.key ? 600 : 400,
            color: activeTab === tab.key ? 'var(--text-primary)' : 'var(--text-muted)',
            borderBottom: activeTab === tab.key ? '2px solid var(--text-primary)' : '2px solid transparent',
            marginBottom: -1, cursor: 'pointer',
          }}>
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* List */}
      {loading && <div style={{ padding: 24, color: 'var(--text-muted)', fontSize: 13 }}>Ładowanie…</div>}

      {!loading && filtered.length === 0 && (
        <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>{ TABS.find(t => t.key === activeTab)?.icon }</div>
          <div style={{ fontSize: 14 }}>Brak wpisów. Zacznij prowadzić dziennik!</div>
        </div>
      )}

      {activeTab === 'sleep' && filtered.map(log => (
        <div key={log.id} className="list-item">
          <div className="list-icon" style={{ background: '#f0eeff', fontSize: 18 }}>😴</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 500, fontSize: 14 }}>{log.date}</span>
              <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                {log.bedtime} → {log.wakeTime}
              </span>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 5, flexWrap: 'wrap' }}>
              <span className="tag active">⭐ {log.sleepQualityRating}/10</span>
              {log.hadNightmares && <span className="tag">😱 Koszmary</span>}
              {log.environmentalContext?.moonData?.phase && (
                <span className="tag">{MOON_EMOJI[log.environmentalContext.moonData.phase]} {log.environmentalContext.moonData.phase?.replace('_', ' ')}</span>
              )}
              {log.eveningRituals?.slice(0, 2).map(r => <span key={r} className="tag">{r}</span>)}
            </div>
          </div>
        </div>
      ))}

      {activeTab === 'mood' && filtered.map(log => (
        <div key={log.id} className="list-item">
          <div className="list-icon" style={{ background: '#eefff4', fontSize: 18 }}>🌈</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: 500, fontSize: 14 }}>{log.date}</span>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>⚡ {log.energyLevel}/10</span>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 5 }}>
              <span className="tag">Rano: {log.morningMood}</span>
              <span className="tag active">Wieczór: {log.eveningMood}</span>
            </div>
            {log.notes && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{log.notes}</div>}
          </div>
        </div>
      ))}

      {activeTab === 'dream' && filtered.map(log => (
        <div key={log.id} className="list-item">
          <div className="list-icon" style={{ background: '#fff8ee', fontSize: 18 }}>🌙</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: 500, fontSize: 14 }}>{log.date}</span>
              {log.isRecurring && <span className="tag">🔁 Powracający</span>}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {log.dreamDescription}
            </div>
            <div style={{ display: 'flex', gap: 6, marginTop: 5, flexWrap: 'wrap' }}>
              <span className="tag active">{log.clarity}</span>
              <span className="tag">{log.sentiment}</span>
              {log.symbols?.slice(0, 3).map(s => <span key={s} className="tag">{s}</span>)}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
