import { useEffect, useState } from 'react';
import { useJournalStore } from '../../store/journalStore';

const TABS = [
  { key: 'sleep', icon: '😴', label: 'Sen' },
  { key: 'mood',  icon: '🌈', label: 'Nastrój' },
  { key: 'dream', icon: '🌙', label: 'Sny' },
];

const MOON_EMOJI = { NEW_MOON:'🌑', WAXING_CRESCENT:'🌒', FIRST_QUARTER:'🌓', WAXING_GIBBOUS:'🌔', FULL_MOON:'🌕', WANING_GIBBOUS:'🌖', LAST_QUARTER:'🌗', WANING_CRESCENT:'🌘' };

function Tag({ children, active }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border
      ${active
        ? 'bg-violet-100 text-violet-700 border-violet-200'
        : 'bg-gray-100 text-gray-600 border-gray-200'}`}>
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
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">

      {/* Search bar */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
        <span className="text-gray-400 text-sm">🔍</span>
        <input
          className="flex-1 text-sm bg-transparent outline-none placeholder-gray-400"
          placeholder="Szukaj w dzienniku…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        {search && (
          <button onClick={() => setSearch('')} className="text-gray-400 hover:text-gray-600 text-sm leading-none border-none bg-transparent cursor-pointer">✕</button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex px-2 border-b border-gray-100">
        {TABS.map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-1.5 px-3.5 py-3 text-sm border-none bg-transparent cursor-pointer transition-colors -mb-px
              ${activeTab === tab.key
                ? 'font-semibold text-gray-900 border-b-2 border-gray-900'
                : 'font-normal text-gray-400 hover:text-gray-600 border-b-2 border-transparent'}`}>
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* States */}
      {loading && (
        <div className="px-5 py-6 text-sm text-gray-400">Ładowanie…</div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="py-16 text-center">
          <div className="text-4xl mb-3">{TABS.find(t => t.key === activeTab)?.icon}</div>
          <div className="text-sm text-gray-400">Brak wpisów. Zacznij prowadzić dziennik!</div>
        </div>
      )}

      {/* Sleep list */}
      {activeTab === 'sleep' && filtered.map(log => (
        <div key={log.id} className="flex items-center gap-3.5 px-5 py-3.5 border-b border-gray-100 last:border-none hover:bg-gray-50 transition-colors">
          <div className="w-10 h-10 bg-violet-50 rounded-xl flex items-center justify-center text-lg shrink-0">😴</div>
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-900">{log.date}</span>
              <span className="text-xs text-gray-400">{log.bedtime} → {log.wakeTime}</span>
            </div>
            <div className="flex gap-1.5 mt-1.5 flex-wrap">
              <Tag active>⭐ {log.sleepQualityRating}/10</Tag>
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
      {activeTab === 'mood' && filtered.map(log => (
        <div key={log.id} className="flex items-center gap-3.5 px-5 py-3.5 border-b border-gray-100 last:border-none hover:bg-gray-50 transition-colors">
          <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-lg shrink-0">🌈</div>
          <div className="flex-1 min-w-0">
            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-900">{log.date}</span>
              <span className="text-xs text-gray-400">⚡ {log.energyLevel}/10</span>
            </div>
            <div className="flex gap-1.5 mt-1.5">
              <Tag>Rano: {log.morningMood}</Tag>
              <Tag active>Wieczór: {log.eveningMood}</Tag>
            </div>
            {log.notes && (
              <div className="text-xs text-gray-400 mt-1 truncate">{log.notes}</div>
            )}
          </div>
        </div>
      ))}

      {/* Dream list */}
      {activeTab === 'dream' && filtered.map(log => (
        <div key={log.id} className="flex items-center gap-3.5 px-5 py-3.5 border-b border-gray-100 last:border-none hover:bg-gray-50 transition-colors">
          <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-lg shrink-0">🌙</div>
          <div className="flex-1 min-w-0">
            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-900">{log.date}</span>
              {log.isRecurring && <Tag>🔁 Powracający</Tag>}
            </div>
            <div className="text-xs text-gray-500 mt-1 truncate">{log.dreamDescription}</div>
            <div className="flex gap-1.5 mt-1.5 flex-wrap">
              <Tag active>{log.clarity}</Tag>
              <Tag>{log.sentiment}</Tag>
              {log.symbols?.slice(0, 3).map(s => <Tag key={s}>{s}</Tag>)}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
