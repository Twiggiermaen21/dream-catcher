import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useJournalStore } from '../../store/journalStore';

const TABS = [
  { key: 'sleep', icon: '😴', label: 'Sen' },
  { key: 'mood',  icon: '🌈', label: 'Nastrój' },
  { key: 'dream', icon: '🌙', label: 'Sny' },
];

const MOON_EMOJI = {
  NEW_MOON: '🌑', WAXING_CRESCENT: '🌒', FIRST_QUARTER: '🌓',
  WAXING_GIBBOUS: '🌔', FULL_MOON: '🌕', WANING_GIBBOUS: '🌖',
  LAST_QUARTER: '🌗', WANING_CRESCENT: '🌘',
};

const MOOD_LABEL = {
  EUPHORIC: '🤩 Euforyczny', HAPPY: '😊 Szczęśliwy', NEUTRAL: '😐 Neutralny',
  ANXIOUS: '😰 Niespokojny', SAD: '😢 Smutny', IRRITABLE: '😤 Drażliwy', EXHAUSTED: '😴 Wyczerpany',
};

const CLARITY_LABEL = { VIVID: '✨ Wyraźny', NORMAL: '😌 Normalny', BLURRY: '🌫️ Rozmyty', FORGOTTEN: '❓ Zapomniany' };
const SENTIMENT_LABEL = { POSITIVE: '😊 Pozytywny', NEUTRAL: '😐 Neutralny', MIXED: '🤔 Mieszany', NEGATIVE: '😨 Negatywny' };

const fmtDate = (dateStr) =>
  new Date(dateStr + 'T12:00:00').toLocaleDateString('pl-PL', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

function Tag({ children, color = 'default' }) {
  const cls = {
    default: 'bg-white/5 text-muted border-white/10',
    accent:  'bg-accent/15 text-accent border-accent/25',
    pink:    'bg-pink/15 text-pink border-pink/25',
    gold:    'bg-gold/15 text-gold border-gold/25',
    teal:    'bg-teal/15 text-teal border-teal/25',
  }[color];
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${cls}`}>
      {children}
    </span>
  );
}

export default function Journal() {
  const { sleepLogs, moodLogs, dreamLogs, fetchAll, loading, deleteSleepLog, deleteMoodLog, deleteDreamLog } = useJournalStore();
  const [activeTab, setActiveTab] = useState('sleep');
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [confirmId, setConfirmId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const logs = { sleep: sleepLogs, mood: moodLogs, dream: dreamLogs }[activeTab];
  const filtered = logs.filter(l =>
    !search || JSON.stringify(l).toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id) => {
    setDeleting(true);
    try {
      if (activeTab === 'sleep') await deleteSleepLog(id);
      else if (activeTab === 'mood') await deleteMoodLog(id);
      else await deleteDreamLog(id);
      setConfirmId(null);
      setExpandedId(null);
    } finally { setDeleting(false); }
  };

  const handleEdit = (log) => {
    navigate('/new-entry', { state: { editing: true, type: activeTab, log } });
  };

  const TAB_CONFIG = {
    sleep: { icon: '😴', iconBg: 'bg-accent/10', glow: 'shadow-glow-purple' },
    mood:  { icon: '🌈', iconBg: 'bg-teal/10',   glow: 'shadow-[0_0_15px_rgba(34,211,238,0.2)]' },
    dream: { icon: '🌙', iconBg: 'bg-gold/10',    glow: 'shadow-[0_0_15px_rgba(244,168,50,0.2)]' },
  };

  return (
    <div className="glass rounded-3xl overflow-hidden max-w-5xl mx-auto shadow-2xl">

      {/* Search */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-white/5 bg-white/2">
        <span className="text-muted text-lg opacity-50">🔍</span>
        <input
          className="flex-1 text-sm bg-transparent outline-none text-white placeholder-muted/50 font-medium"
          placeholder="Szukaj w dzienniku…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        {search && (
          <button onClick={() => setSearch('')}
            className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-white/10 text-muted transition-colors cursor-pointer border-none bg-transparent">
            ✕
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex px-4 border-b border-white/5 bg-white/1">
        {TABS.map(tab => (
          <button key={tab.key} onClick={() => { setActiveTab(tab.key); setExpandedId(null); setConfirmId(null); }}
            className={`flex items-center gap-2 px-6 py-4 text-sm font-bold tracking-wide border-none bg-transparent cursor-pointer transition-all relative ${
              activeTab === tab.key ? 'text-white' : 'text-muted hover:text-white/70'
            }`}>
            {tab.icon} {tab.label}
            {activeTab === tab.key && (
              <div className="absolute bottom-0 left-6 right-6 h-0.5 bg-accent shadow-glow-purple rounded-full" />
            )}
          </button>
        ))}
      </div>

      <div className="min-h-[400px]">
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
            <div className="text-muted text-sm font-medium animate-pulse">Synchronizacja gwiezdnego pyłu…</div>
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="py-24 text-center">
            <div className="text-6xl mb-6 grayscale opacity-20">{TABS.find(t => t.key === activeTab)?.icon}</div>
            <div className="text-muted text-sm font-medium italic">Ta karta historii jest jeszcze pusta…</div>
          </div>
        )}

        <div className="divide-y divide-white/3">
          {!loading && filtered.map((log) => {
            const cfg = TAB_CONFIG[activeTab];
            const isExpanded = expandedId === log.id;
            const isConfirm = confirmId === log.id;

            return (
              <div key={log.id} className={`transition-all ${isExpanded ? 'bg-white/3' : 'hover:bg-white/2'}`}>

                {/* Row */}
                <div
                  className="flex items-start gap-5 px-6 py-5 cursor-pointer"
                  onClick={() => { setExpandedId(isExpanded ? null : log.id); setConfirmId(null); }}
                >
                  <div className={`w-12 h-12 rounded-2xl ${cfg.iconBg} flex items-center justify-center text-2xl shrink-0 transition-transform ${cfg.glow} ${isExpanded ? 'scale-110' : 'group-hover:scale-105'}`}>
                    {cfg.icon}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-2">
                      <span className="text-white font-bold text-[15px] capitalize">{fmtDate(log.date)}</span>
                      <span className="text-muted text-[11px] font-bold tracking-wider uppercase">
                        {activeTab === 'sleep'
                          ? `${log.bedtime?.slice(0,5)} → ${log.wakeTime?.slice(0,5)}`
                          : activeTab === 'mood'
                          ? `Energia ${log.energyLevel}/10`
                          : CLARITY_LABEL[log.clarity] ?? log.clarity}
                      </span>
                    </div>

                    <div className="flex gap-2 flex-wrap">
                      {activeTab === 'sleep' && (
                        <>
                          <Tag color="accent">Jakość: {log.sleepQualityRating}/10</Tag>
                          {log.hadNightmares && <Tag color="pink">😱 Koszmary</Tag>}
                          {log.environmentalContext?.moonData?.phase && (
                            <Tag>{MOON_EMOJI[log.environmentalContext.moonData.phase]} {log.environmentalContext.moonData.phase?.replace(/_/g,' ')}</Tag>
                          )}
                        </>
                      )}
                      {activeTab === 'mood' && (
                        <>
                          <Tag>Rano: {MOOD_LABEL[log.morningMood] ?? log.morningMood}</Tag>
                          <Tag color="accent">Wieczór: {MOOD_LABEL[log.eveningMood] ?? log.eveningMood}</Tag>
                        </>
                      )}
                      {activeTab === 'dream' && (
                        <>
                          {log.isRecurring && <Tag color="gold">🔁 Powracający</Tag>}
                          <Tag>{SENTIMENT_LABEL[log.sentiment] ?? log.sentiment}</Tag>
                          {log.symbols?.slice(0, 3).map(s => <Tag key={s}>#{s}</Tag>)}
                          {(log.symbols?.length ?? 0) > 3 && <Tag>+{log.symbols.length - 3}</Tag>}
                        </>
                      )}
                    </div>
                  </div>

                  <div className={`self-center text-xl pl-2 transition-all duration-200 ${isExpanded ? 'text-accent rotate-90' : 'text-white/15'}`}>›</div>
                </div>

                {/* Expanded details */}
                {isExpanded && (
                  <div className="px-6 pb-5 pt-1 border-t border-white/5">

                    {/* Detail content */}
                    <div className="ml-17 pl-1 mb-5 space-y-3">

                      {activeTab === 'sleep' && (
                        <>
                          {log.eveningRituals?.length > 0 && (
                            <div>
                              <div className="text-[10px] font-bold text-muted/50 uppercase tracking-wider mb-1.5">Rytuały wieczorne</div>
                              <div className="flex flex-wrap gap-1.5">
                                {log.eveningRituals.map(r => <Tag key={r}>{r}</Tag>)}
                              </div>
                            </div>
                          )}
                          {log.environmentalContext && (
                            <div className="flex gap-3 text-xs text-muted font-medium">
                              {log.environmentalContext.weatherData?.temperatureCelsius != null && (
                                <span>🌡️ {log.environmentalContext.weatherData.temperatureCelsius}°C</span>
                              )}
                              {log.environmentalContext.weatherData?.pressureHpa != null && (
                                <span>🌬️ {log.environmentalContext.weatherData.pressureHpa} hPa</span>
                              )}
                            </div>
                          )}
                        </>
                      )}

                      {activeTab === 'mood' && (
                        <>
                          <div className="flex gap-4 text-xs font-medium text-muted">
                            <span>⚡ Energia: <span className="text-teal font-bold">{log.energyLevel}/10</span></span>
                            <span>😤 Stres: <span className="text-pink font-bold">{log.stressLevel}/10</span></span>
                          </div>
                          {log.notes && (
                            <div className="text-muted/80 text-sm leading-relaxed italic border-l-2 border-white/8 pl-4">
                              {log.notes}
                            </div>
                          )}
                        </>
                      )}

                      {activeTab === 'dream' && (
                        <>
                          {log.dreamDescription && (
                            <div className="text-muted/80 text-sm leading-relaxed italic border-l-2 border-gold/20 pl-4">
                              {log.dreamDescription}
                            </div>
                          )}
                          {log.symbols?.length > 0 && (
                            <div className="flex flex-wrap gap-1.5">
                              {log.symbols.map(s => <Tag key={s} color="gold">#{s}</Tag>)}
                            </div>
                          )}
                        </>
                      )}
                    </div>

                    {/* Actions */}
                    {!isConfirm ? (
                      <div className="flex gap-2 justify-end">
                        <button onClick={() => handleEdit(log)}
                          className="px-4 py-2 rounded-xl text-xs font-bold border border-white/10 bg-white/5 text-muted hover:bg-white/10 hover:text-white transition-all cursor-pointer">
                          ✏️ Edytuj
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); setConfirmId(log.id); }}
                          className="px-4 py-2 rounded-xl text-xs font-bold border border-pink/20 bg-pink/8 text-pink hover:bg-pink/15 transition-all cursor-pointer">
                          🗑️ Usuń
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-end gap-3 bg-pink/8 border border-pink/20 rounded-2xl px-4 py-3">
                        <span className="text-sm font-bold text-white/70 flex-1">Usunąć ten wpis? Tego nie można cofnąć.</span>
                        <button onClick={() => setConfirmId(null)}
                          className="px-4 py-2 rounded-xl text-xs font-bold border border-white/10 bg-white/5 text-muted hover:bg-white/10 transition-all cursor-pointer">
                          Anuluj
                        </button>
                        <button onClick={() => handleDelete(log.id)} disabled={deleting}
                          className="px-4 py-2 rounded-xl text-xs font-black border-none bg-pink text-white hover:bg-pink/80 transition-all cursor-pointer disabled:opacity-50 shadow-[0_4px_15px_rgba(232,121,160,0.4)]">
                          {deleting ? '…' : 'Tak, usuń'}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
