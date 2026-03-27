import { useEffect, useState } from 'react';
import { useJournalStore } from '../../store/journalStore';

const TABS = [
  { key: 'sleep', icon: '😴', label: 'Sen' },
  { key: 'mood',  icon: '🌈', label: 'Nastrój' },
  { key: 'dream', icon: '🌙', label: 'Sny' },
];

const MOON_EMOJI = { NEW_MOON:'🌑', WAXING_CRESCENT:'🌒', FIRST_QUARTER:'🌓', WAXING_GIBBOUS:'🌔', FULL_MOON:'🌕', WANING_GIBBOUS:'🌖', LAST_QUARTER:'🌗', WANING_CRESCENT:'🌘' };

const card = { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', backdropFilter: 'blur(12px)' };

function Tag({ children, accent }) {
  return (
    <span
      className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium"
      style={accent
        ? { background: 'rgba(124,106,245,0.15)', color: '#c4baff', border: '1px solid rgba(124,106,245,0.25)' }
        : { background: 'rgba(255,255,255,0.06)', color: '#8b8aaa', border: '1px solid rgba(255,255,255,0.08)' }
      }
    >
      {children}
    </span>
  );
}

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
    <div className="rounded-2xl overflow-hidden" style={card}>

      {/* Search bar */}
      <div className="flex items-center gap-2 px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <span className="text-sm" style={{ color: '#8b8aaa' }}>🔍</span>
        <input
          className="flex-1 text-sm bg-transparent outline-none text-white"
          placeholder="Szukaj w dzienniku…"
          style={{ caretColor: '#7c6af5' }}
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        {search && (
          <button onClick={() => setSearch('')} className="text-sm leading-none border-none bg-transparent cursor-pointer transition-colors"
            style={{ color: '#8b8aaa' }}>✕</button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex px-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        {TABS.map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className="flex items-center gap-1.5 px-4 py-3 text-sm border-none bg-transparent cursor-pointer transition-all -mb-px"
            style={activeTab === tab.key
              ? { color: '#c4baff', fontWeight: 600, borderBottom: '2px solid #7c6af5' }
              : { color: '#8b8aaa', borderBottom: '2px solid transparent' }
            }>
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {loading && (
        <div className="px-5 py-6 text-sm" style={{ color: '#8b8aaa' }}>Ładowanie…</div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="py-16 text-center">
          <div className="text-4xl mb-3">{TABS.find(t => t.key === activeTab)?.icon}</div>
          <div className="text-sm" style={{ color: '#8b8aaa' }}>Brak wpisów. Zacznij prowadzić dziennik!</div>
        </div>
      )}

      {/* Sleep list */}
      {activeTab === 'sleep' && filtered.map((log, i) => (
        <div key={log.id} className="flex items-center gap-3.5 px-5 py-3.5 transition-all"
          style={{ borderBottom: i < filtered.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0"
            style={{ background: 'rgba(124,106,245,0.15)' }}>😴</div>
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-white">{log.date}</span>
              <span className="text-xs" style={{ color: '#8b8aaa' }}>{log.bedtime} → {log.wakeTime}</span>
            </div>
            <div className="flex gap-1.5 mt-1.5 flex-wrap">
              <Tag accent>⭐ {log.sleepQualityRating}/10</Tag>
              {log.hadNightmares && <Tag>😱 Koszmary</Tag>}
              {log.environmentalContext?.moonData?.phase && (
                <Tag>{MOON_EMOJI[log.environmentalContext.moonData.phase]} {log.environmentalContext.moonData.phase?.replace('_', ' ')}</Tag>
              )}
              {log.eveningRituals?.slice(0, 2).map(r => <Tag key={r}>{r}</Tag>)}
            </div>
          </div>
        </div>
      ))}

      {/* Mood list */}
      {activeTab === 'mood' && filtered.map((log, i) => (
        <div key={log.id} className="flex items-center gap-3.5 px-5 py-3.5 transition-all"
          style={{ borderBottom: i < filtered.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0"
            style={{ background: 'rgba(34,211,238,0.15)' }}>🌈</div>
          <div className="flex-1 min-w-0">
            <div className="flex justify-between">
              <span className="text-sm font-medium text-white">{log.date}</span>
              <span className="text-xs" style={{ color: '#8b8aaa' }}>⚡ {log.energyLevel}/10</span>
            </div>
            <div className="flex gap-1.5 mt-1.5">
              <Tag>Rano: {log.morningMood}</Tag>
              <Tag accent>Wieczór: {log.eveningMood}</Tag>
            </div>
            {log.notes && (
              <div className="text-xs mt-1 truncate" style={{ color: '#8b8aaa' }}>{log.notes}</div>
            )}
          </div>
        </div>
      ))}

      {/* Dream list */}
      {activeTab === 'dream' && filtered.map((log, i) => (
        <div key={log.id} className="flex items-center gap-3.5 px-5 py-3.5 transition-all"
          style={{ borderBottom: i < filtered.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0"
            style={{ background: 'rgba(244,168,50,0.15)' }}>🌙</div>
          <div className="flex-1 min-w-0">
            <div className="flex justify-between">
              <span className="text-sm font-medium text-white">{log.date}</span>
              {log.isRecurring && <Tag>🔁 Powracający</Tag>}
            </div>
            <div className="text-xs mt-1 truncate" style={{ color: '#8b8aaa' }}>{log.dreamDescription}</div>
            <div className="flex gap-1.5 mt-1.5 flex-wrap">
              <Tag accent>{log.clarity}</Tag>
              <Tag>{log.sentiment}</Tag>
              {log.symbols?.slice(0, 3).map(s => <Tag key={s}>{s}</Tag>)}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
