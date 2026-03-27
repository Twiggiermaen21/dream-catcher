import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts';
import { useJournalStore } from '../../store/journalStore';
import { useDailyContext }  from '../../hooks/useDailyContext';
import { useAuthStore }     from '../../store/authStore';

/* ─── helpers ─── */
const MOON_EMOJI = { NEW_MOON:'🌑',WAXING_CRESCENT:'🌒',FIRST_QUARTER:'🌓',WAXING_GIBBOUS:'🌔',FULL_MOON:'🌕',WANING_GIBBOUS:'🌖',LAST_QUARTER:'🌗',WANING_CRESCENT:'🌘' };
const MOON_PL    = { NEW_MOON:'Nów',WAXING_CRESCENT:'Sierp rosnący',FIRST_QUARTER:'I kwadra',WAXING_GIBBOUS:'Garb rosnący',FULL_MOON:'Pełnia',WANING_GIBBOUS:'Garb malejący',LAST_QUARTER:'III kwadra',WANING_CRESCENT:'Sierp malejący' };

const ZODIAC = [
  { name:'Baran',     emoji:'♈', dates:'21.03–19.04' }, { name:'Byk',       emoji:'♉', dates:'20.04–20.05' },
  { name:'Bliźnięta', emoji:'♊', dates:'21.05–20.06' }, { name:'Rak',       emoji:'♋', dates:'21.06–22.07' },
  { name:'Lew',       emoji:'♌', dates:'23.07–22.08' }, { name:'Panna',     emoji:'♍', dates:'23.08–22.09' },
  { name:'Waga',      emoji:'♎', dates:'23.09–22.10' }, { name:'Skorpion',  emoji:'♏', dates:'23.10–21.11' },
  { name:'Strzelec',  emoji:'♐', dates:'22.11–21.12' }, { name:'Koziorożec',emoji:'♑', dates:'22.12–19.01' },
  { name:'Wodnik',    emoji:'♒', dates:'20.01–18.02' }, { name:'Ryby',      emoji:'♓', dates:'19.02–20.03' },
];
const HOROSCOPES = [
  'Dziś wyjątkowo sprzyjające warunki do głębokiego, regenerującego snu. Księżyc harmonizuje z Twoim znakiem.',
  'Nocne marzenia mogą przynieść ważne odpowiedzi. Trzymaj dziennik pod ręką przy łóżku.',
  'Energia planet sprzyja introspekcji. Wieczorna medytacja poprawi jakość snu.',
  'Twoja intuicja jest dziś wyostrzona. Warto zapisać wszystkie sny — mogą nieść symboliczne przesłanie.',
];

function getZodiac() {
  const today = new Date();
  const m = today.getMonth() + 1, d = today.getDate();
  const idx = [
    [3,21],[4,20],[5,21],[6,21],[7,23],[8,23],[9,23],[10,23],[11,22],[12,22],[1,20],[2,19]
  ].findIndex(([sm, sd], i, arr) => {
    const [nm, nd] = arr[(i+1) % 12];
    return (m === sm && d >= sd) || (m === nm && d < nd);
  });
  return ZODIAC[idx >= 0 ? idx : 0];
}

/* ─── shared styles ─── */
const glass = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.07)',
  backdropFilter: 'blur(12px)',
  borderRadius: 20,
};
const glassHover = {
  ...glass,
  transition: 'transform 0.2s, box-shadow 0.2s',
};
const section = { color: '#8b8aaa', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10 };

function CardHeader({ label, extra }) {
  return (
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: 16 }}>
      <span style={section}>{label}</span>
      {extra && <span style={{ color:'#8b8aaa', fontSize: 11 }}>{extra}</span>}
    </div>
  );
}

function Pill({ children, color = '#7c6af5' }) {
  return (
    <span style={{
      display:'inline-flex', alignItems:'center', padding:'3px 10px', borderRadius: 20,
      fontSize: 11, fontWeight: 600,
      background: `${color}22`, color, border: `1px solid ${color}44`,
    }}>{children}</span>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background:'#1a1b30', border:'1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding:'8px 12px', fontSize: 12, color:'#f0eeff' }}>
      <div style={{ color:'#8b8aaa', marginBottom: 2 }}>{label}</div>
      <div style={{ color:'#c4baff', fontWeight: 700 }}>Jakość: {payload[0].value}/10</div>
    </div>
  );
};

/* ─── main component ─── */
export default function Dashboard() {
  const { sleepLogs, moodLogs, dreamLogs, fetchAll } = useJournalStore();
  const { context, loading: ctxLoading } = useDailyContext();
  const { user } = useAuthStore();
  const zodiac   = getZodiac();
  const horoscope = HOROSCOPES[new Date().getDate() % HOROSCOPES.length];

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const recentAll = [
    ...sleepLogs.map(l => ({ ...l, type: 'sleep' })),
    ...moodLogs.map(l => ({ ...l, type: 'mood' })),
    ...dreamLogs.map(l => ({ ...l, type: 'dream' })),
  ].sort((a, b) => (b.date > a.date ? 1 : -1)).slice(0, 5);

  const sleepChartData = [...sleepLogs]
    .sort((a, b) => (a.date > b.date ? 1 : -1))
    .slice(-7)
    .map(l => ({ date: l.date?.slice(5), val: l.sleepQualityRating }));

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Dzień dobry' : hour < 18 ? 'Dzień dobry' : 'Dobry wieczór';
  const firstName = user?.displayName?.split(' ')[0] ?? 'użytkowniku';

  return (
    <div style={{ display:'flex', flexDirection:'column', gap: 22, paddingBottom: 8 }}>

      {/* ── Header ── */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div>
          <div style={{ color:'#8b8aaa', fontSize: 12, marginBottom: 4 }}>
            {new Date().toLocaleDateString('pl-PL', { weekday:'long', day:'numeric', month:'long', year:'numeric' })}
          </div>
          <h1 style={{ color:'#f0eeff', fontSize: 26, fontWeight: 700, lineHeight: 1.2 }}>
            {greeting}, <span style={{ background:'linear-gradient(90deg,#c4baff,#e879a0)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>{firstName}</span> ✦
          </h1>
          <div style={{ color:'#8b8aaa', fontSize: 13, marginTop: 5 }}>
            Masz <strong style={{ color:'#c4baff' }}>{sleepLogs.length + moodLogs.length + dreamLogs.length}</strong> wpisów w dzienniku
          </div>
        </div>
        <div style={{
          width: 48, height: 48, borderRadius: 16, flexShrink: 0,
          background:'linear-gradient(135deg,#7c6af5,#e879a0)',
          display:'flex', alignItems:'center', justifyContent:'center',
          fontSize: 20, fontWeight: 700, color:'white',
          boxShadow:'0 0 24px rgba(124,106,245,0.35)',
        }}>
          {(user?.displayName?.[0] ?? '?').toUpperCase()}
        </div>
      </div>

      {/* ── Quick actions ── */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap: 12 }}>
        {[
          { to:'/new-entry', icon:'😴', label:'Dodaj sen',    sub:'Zapisz noc',        grad:'linear-gradient(135deg,rgba(124,106,245,0.25),rgba(80,60,180,0.1))', glow:'rgba(124,106,245,0.3)', border:'rgba(124,106,245,0.3)' },
          { to:'/new-entry', icon:'🌈', label:'Zapisz nastrój', sub:'Jak się czujesz?', grad:'linear-gradient(135deg,rgba(34,211,238,0.2),rgba(20,140,160,0.08))', glow:'rgba(34,211,238,0.25)', border:'rgba(34,211,238,0.25)' },
          { to:'/new-entry', icon:'🌙', label:'Opisz sen',    sub:'Zanim zapomnisz',   grad:'linear-gradient(135deg,rgba(244,168,50,0.2),rgba(180,110,20,0.08))',  glow:'rgba(244,168,50,0.25)', border:'rgba(244,168,50,0.25)' },
        ].map((a, i) => (
          <Link key={i} to={a.to} style={{ textDecoration:'none' }}
            onMouseEnter={e => { e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow=`0 8px 32px ${a.glow}`; }}
            onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='none'; }}
          >
            <div style={{ ...glass, background: a.grad, border:`1px solid ${a.border}`, padding:'18px 20px', borderRadius: 18, transition:'transform 0.2s, box-shadow 0.2s' }}>
              <div style={{ fontSize: 28, marginBottom: 10 }}>{a.icon}</div>
              <div style={{ color:'#f0eeff', fontWeight: 700, fontSize: 14 }}>{a.label}</div>
              <div style={{ color:'#8b8aaa', fontSize: 12, marginTop: 3 }}>{a.sub}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* ── 3-column grid ── */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap: 14 }}>

        {/* Moon */}
        <div style={glass}>
          <div style={{ padding:'18px 20px' }}>
            <CardHeader label="Stan kosmosu" />
            {ctxLoading ? (
              <div style={{ color:'#8b8aaa', fontSize: 13 }}>Pobieranie…</div>
            ) : context?.moonData ? (
              <>
                <div style={{ textAlign:'center', padding:'10px 0 14px' }}>
                  <div style={{ fontSize: 52, lineHeight: 1, filter:'drop-shadow(0 0 16px rgba(244,168,50,0.5))' }}>
                    {MOON_EMOJI[context.moonData.phase] ?? '🌙'}
                  </div>
                  <div style={{ color:'#f0eeff', fontWeight: 700, fontSize: 17, marginTop: 10 }}>
                    {MOON_PL[context.moonData.phase] ?? '—'}
                  </div>
                  <div style={{ color:'#8b8aaa', fontSize: 12, marginTop: 4 }}>
                    Oświetlenie: <span style={{ color:'#f4a832' }}>{context.moonData.illuminationPercent?.toFixed(0) ?? '?'}%</span>
                  </div>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap: 8, marginTop: 4 }}>
                  {[
                    { icon:'🌅', label:'Wschód', val: context.sunrise ?? '—' },
                    { icon:'🌇', label:'Zachód',  val: context.sunset  ?? '—' },
                  ].map((r, i) => (
                    <div key={i} style={{ background:'rgba(255,255,255,0.04)', borderRadius: 12, padding:'10px 12px', border:'1px solid rgba(255,255,255,0.06)' }}>
                      <div style={{ fontSize: 18 }}>{r.icon}</div>
                      <div style={{ color:'#8b8aaa', fontSize: 10, marginTop: 4 }}>{r.label}</div>
                      <div style={{ color:'#f0eeff', fontWeight: 600, fontSize: 12, marginTop: 2 }}>{r.val}</div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div style={{ color:'#8b8aaa', fontSize: 13 }}>Brak danych</div>
            )}
          </div>
        </div>

        {/* Weather / Biomet */}
        <div style={glass}>
          <div style={{ padding:'18px 20px' }}>
            <CardHeader label="Biomet" />
            {ctxLoading ? (
              <div style={{ color:'#8b8aaa', fontSize: 13 }}>Pobieranie…</div>
            ) : context?.weatherData ? (() => {
              const p = context.weatherData.pressureHpa;
              const sleepScore = p > 1013 ? 'Dobre warunki' : p > 1000 ? 'Umiarkowane' : 'Niskie ciśnienie';
              const sleepColor = p > 1013 ? '#4ade80' : p > 1000 ? '#f4a832' : '#e879a0';
              return (
                <>
                  <div style={{ display:'flex', flexDirection:'column', gap: 12, marginBottom: 16 }}>
                    {[
                      { icon:'🌡️', label:'Temperatura',  val:`${context.weatherData.temperatureCelsius?.toFixed(1)}°C`, color:'#22d3ee' },
                      { icon:'🔵', label:'Ciśnienie',     val:`${p?.toFixed(0)} hPa`,                                  color: p < 1000 ? '#e879a0' : '#c4baff' },
                      { icon:'💧', label:'Wilgotność',    val:`${context.weatherData.humidity?.toFixed(0)}%`,           color:'#7c6af5' },
                    ].map((row, i) => (
                      <div key={i} style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                        <div style={{ display:'flex', alignItems:'center', gap: 8 }}>
                          <span style={{ fontSize: 16 }}>{row.icon}</span>
                          <span style={{ color:'#8b8aaa', fontSize: 12 }}>{row.label}</span>
                        </div>
                        <span style={{ color: row.color, fontWeight: 700, fontSize: 14 }}>{row.val}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ background:'rgba(255,255,255,0.04)', borderRadius: 14, padding:'12px 14px', border:'1px solid rgba(255,255,255,0.06)', textAlign:'center' }}>
                    <div style={{ fontSize: 22, marginBottom: 6 }}>🌙</div>
                    <div style={{ color: sleepColor, fontWeight: 700, fontSize: 13 }}>{sleepScore}</div>
                    <div style={{ color:'#8b8aaa', fontSize: 11, marginTop: 3 }}>do snu tej nocy</div>
                  </div>
                </>
              );
            })() : (
              <div style={{ color:'#8b8aaa', fontSize: 13 }}>Brak danych pogodowych</div>
            )}
          </div>
        </div>

        {/* Zodiac */}
        <div style={glass}>
          <div style={{ padding:'18px 20px' }}>
            <CardHeader label="Zodiak" extra={zodiac.dates} />
            <div style={{ textAlign:'center', padding:'8px 0 16px' }}>
              <div style={{ fontSize: 44, lineHeight: 1, filter:'drop-shadow(0 0 14px rgba(232,121,160,0.5))' }}>
                {zodiac.emoji}
              </div>
              <div style={{ color:'#f0eeff', fontWeight: 700, fontSize: 18, marginTop: 10 }}>{zodiac.name}</div>
              <Pill color="#e879a0">{zodiac.dates}</Pill>
            </div>
            <div style={{
              background:'rgba(232,121,160,0.07)', border:'1px solid rgba(232,121,160,0.15)',
              borderRadius: 14, padding:'12px 14px', marginTop: 4,
            }}>
              <div style={{ color:'#8b8aaa', fontSize: 10, fontWeight: 700, letterSpacing:'0.1em', textTransform:'uppercase', marginBottom: 6 }}>Horoskop snu</div>
              <div style={{ color:'#d0cff0', fontSize: 12, lineHeight: 1.6 }}>{horoscope}</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom row: chart + recent entries ── */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1.6fr', gap: 14 }}>

        {/* Sleep trend chart */}
        <div style={glass}>
          <div style={{ padding:'18px 20px' }}>
            <CardHeader label="Trend jakości snu" extra="ostatnie 7 nocy" />
            {sleepChartData.length < 2 ? (
              <div style={{ textAlign:'center', padding:'30px 0' }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>😴</div>
                <div style={{ color:'#8b8aaa', fontSize: 12 }}>Dodaj wpisy snu, by zobaczyć trend</div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={130}>
                <AreaChart data={sleepChartData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                  <defs>
                    <linearGradient id="sleepGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#7c6af5" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#7c6af5" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="val" stroke="#7c6af5" strokeWidth={2}
                    fill="url(#sleepGrad)" dot={{ fill:'#7c6af5', r: 3, strokeWidth: 0 }} />
                </AreaChart>
              </ResponsiveContainer>
            )}

            {/* Mini stats */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap: 8, marginTop: 14 }}>
              {[
                { label:'Wpisy snu', val: sleepLogs.length, color:'#7c6af5' },
                { label:'Nastroje',  val: moodLogs.length,  color:'#22d3ee' },
                { label:'Sny',       val: dreamLogs.length, color:'#f4a832' },
              ].map((s, i) => (
                <div key={i} style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding:'10px 10px 8px', textAlign:'center' }}>
                  <div style={{ color: s.color, fontWeight: 800, fontSize: 22, lineHeight: 1 }}>{s.val}</div>
                  <div style={{ color:'#8b8aaa', fontSize: 10, marginTop: 4 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent entries */}
        <div style={glass}>
          <div style={{ padding:'18px 20px 0' }}>
            <CardHeader label="Ostatnie wpisy" extra={
              <Link to="/journal" style={{ color:'#7c6af5', textDecoration:'none', fontSize: 12, fontWeight: 600 }}>
                Zobacz wszystkie →
              </Link>
            } />
          </div>

          {recentAll.length === 0 ? (
            <div style={{ textAlign:'center', padding:'30px 0 24px' }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>📖</div>
              <div style={{ color:'#8b8aaa', fontSize: 12 }}>Brak wpisów. Zacznij prowadzić dziennik!</div>
            </div>
          ) : (
            <div>
              {recentAll.map((log, i) => {
                const meta = {
                  sleep: { icon:'😴', color:'#7c6af5', bg:'rgba(124,106,245,0.12)', label:'Sen',    detail: `Jakość: ${log.sleepQualityRating}/10` },
                  mood:  { icon:'🌈', color:'#22d3ee', bg:'rgba(34,211,238,0.12)',  label:'Nastrój', detail: `Energia: ${log.energyLevel}/10` },
                  dream: { icon:'🌙', color:'#f4a832', bg:'rgba(244,168,50,0.12)',  label:'Sen',     detail: log.dreamDescription?.slice(0, 40) + (log.dreamDescription?.length > 40 ? '…' : '') },
                }[log.type];
                return (
                  <div key={log.id ?? i}
                    style={{ display:'flex', alignItems:'center', gap: 12, padding:'12px 20px',
                      borderBottom: i < recentAll.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                      transition:'background 0.15s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.02)'}
                    onMouseLeave={e => e.currentTarget.style.background='transparent'}
                  >
                    <div style={{ width: 38, height: 38, borderRadius: 12, flexShrink: 0,
                      background: meta.bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize: 18 }}>
                      {meta.icon}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display:'flex', alignItems:'center', gap: 8 }}>
                        <span style={{ color:'#f0eeff', fontWeight: 600, fontSize: 13 }}>{log.date}</span>
                        <Pill color={meta.color}>{meta.label}</Pill>
                        {log.hadNightmares && <Pill color="#e879a0">😱 koszmar</Pill>}
                        {log.isRecurring   && <Pill color="#f4a832">🔁 powt.</Pill>}
                      </div>
                      <div style={{ color:'#8b8aaa', fontSize: 12, marginTop: 3, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                        {meta.detail}
                      </div>
                    </div>
                    <div style={{ color:'#2a2b45', fontSize: 18, flexShrink: 0 }}>›</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Footer ── */}
      <div style={{ textAlign:'center', padding:'4px 0 2px', borderTop:'1px solid rgba(255,255,255,0.04)', marginTop: 4 }}>
        <span style={{ color:'#8b8aaa', fontSize: 11 }}>
          🌙 Dream Catcher &nbsp;·&nbsp; {new Date().getFullYear()} &nbsp;·&nbsp; holistic sleep & mood journal
        </span>
      </div>

    </div>
  );
}
