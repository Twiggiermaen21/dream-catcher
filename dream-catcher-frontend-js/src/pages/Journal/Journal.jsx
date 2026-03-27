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
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border transition-colors ${
        accent
          ? 'bg-accent/15 text-accent border-accent/25'
          : 'bg-white/5 text-muted border-white/10'
      }`}
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
    <div className="glass rounded-3xl overflow-hidden max-w-5xl mx-auto shadow-2xl">

      {/* Search bar */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-white/5 bg-white/2">
        <span className="text-muted text-lg opacity-50">🔍</span>
        <input
          className="flex-1 text-sm bg-transparent outline-none text-white placeholder-muted/50 font-medium"
          placeholder="Szukaj w dzienniku…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        {search && (
          <button 
            onClick={() => setSearch('')} 
            className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-white/10 text-muted transition-colors cursor-pointer border-none bg-transparent"
          >✕</button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex px-4 border-b border-white/5 bg-white/1">
        {TABS.map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`
              flex items-center gap-2 px-6 py-4 text-sm font-bold tracking-wide border-none bg-transparent cursor-pointer transition-all relative
              ${activeTab === tab.key ? 'text-white' : 'text-muted hover:text-white/70'}
            `}>
            {tab.icon} {tab.label}
            {activeTab === tab.key && (
              <div className="absolute bottom-0 left-6 right-6 h-0.5 bg-accent shadow-glow-purple rounded-full"></div>
            )}
          </button>
        ))}
      </div>

      <div className="min-h-[400px]">
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin"></div>
            <div className="text-muted text-sm font-medium animate-pulse">Synchronizacja gwiezdnego pyłu…</div>
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="py-24 text-center">
            <div className="text-6xl mb-6 grayscale opacity-20 transform hover:scale-110 transition-transform cursor-default">
              {TABS.find(t => t.key === activeTab)?.icon}
            </div>
            <div className="text-muted text-sm font-medium italic">Ta karta historii jest jeszcze pusta…</div>
          </div>
        )}

        {/* List items */}
        <div className="divide-y divide-white/2">
          {!loading && filtered.map((log, i) => {
            const config = {
              sleep: { icon: '😴', bg: 'bg-accent/10', glow: 'shadow-glow-purple' },
              mood:  { icon: '🌈', bg: 'bg-teal/10',   glow: 'shadow-[0_0_15px_rgba(34,211,238,0.2)]' },
              dream: { icon: '🌙', bg: 'bg-gold/10',   glow: 'shadow-[0_0_15px_rgba(244,168,50,0.2)]' },
            }[activeTab];

            return (
              <div key={log.id} className="group flex items-start gap-5 px-6 py-5 transition-all hover:bg-white/3 cursor-pointer">
                <div className={`w-12 h-12 rounded-2xl ${config.bg} flex items-center justify-center text-2xl shrink-0 group-hover:scale-110 transition-transform ${config.glow}`}>
                  {config.icon}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-2">
                    <span className="text-white font-bold text-[15px]">{log.date}</span>
                    <span className="text-muted text-[11px] font-bold tracking-wider uppercase">
                      {activeTab === 'sleep' ? `${log.bedtime} → ${log.wakeTime}` : activeTab === 'mood' ? `Energia: ${log.energyLevel}/10` : log.clarity}
                    </span>
                  </div>

                  <div className="flex gap-2 mt-2 flex-wrap">
                    {activeTab === 'sleep' && (
                      <>
                        <Tag accent>Jakość: {log.sleepQualityRating}/10</Tag>
                        {log.hadNightmares && <Tag accent>😱 Koszmary</Tag>}
                        {log.environmentalContext?.moonData?.phase && (
                          <Tag>{MOON_EMOJI[log.environmentalContext.moonData.phase]} {log.environmentalContext.moonData.phase?.replace('_', ' ')}</Tag>
                        )}
                        {log.eveningRituals?.map(r => <Tag key={r}>{r}</Tag>)}
                      </>
                    )}
                    
                    {activeTab === 'mood' && (
                      <>
                        <Tag>Rano: {log.morningMood}</Tag>
                        <Tag accent>Wieczór: {log.eveningMood}</Tag>
                      </>
                    )}

                    {activeTab === 'dream' && (
                      <>
                        {log.isRecurring && <Tag accent>🔁 Powracający</Tag>}
                        <Tag>{log.sentiment}</Tag>
                        {log.symbols?.map(s => <Tag key={s}>{s}</Tag>)}
                      </>
                    )}
                  </div>

                  {(log.notes || log.dreamDescription) && (
                    <div className="mt-3 text-muted/80 text-sm leading-relaxed font-medium italic group-hover:text-muted transition-colors border-l-2 border-white/5 pl-4 ml-1">
                      {activeTab === 'dream' ? log.dreamDescription : log.notes}
                    </div>
                  )}
                </div>

                <div className="text-white/10 self-center group-hover:text-accent transition-all text-2xl pl-2 transform group-hover:translate-x-1">
                  ›
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
