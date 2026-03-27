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
function CardHeader({ label, extra }) {
  return (
    <div className="flex justify-between items-baseline mb-5">
      <span className="text-muted text-[10px] font-bold tracking-[0.15em] uppercase">{label}</span>
      {extra && <span className="text-muted/60 text-[11px] font-medium">{extra}</span>}
    </div>
  );
}

function Pill({ children, color = 'accent' }) {
  // Map hex/name to tailwind color if needed, but here we can just use opacity
  const colorClass = {
    accent: 'bg-accent/15 text-accent border-accent/25',
    teal: 'bg-teal/15 text-teal border-teal/25',
    gold: 'bg-gold/15 text-gold border-gold/25',
    pink: 'bg-pink/15 text-pink border-pink/25',
  }[color === '#7c6af5' ? 'accent' : color === '#e879a0' ? 'pink' : color] || 'bg-accent/15 text-accent border-accent/25';

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold border ${colorClass}`}>
      {children}
    </span>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass !bg-[#0f1122]/90 p-3 rounded-2xl border-white/10 shadow-xl">
      <div className="text-muted text-[11px] mb-1 font-medium">{label}</div>
      <div className="text-white font-bold text-sm">Jakość: <span className="text-accent">{payload[0].value}/10</span></div>
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
    <div className="flex flex-col gap-8 pb-10 max-w-6xl mx-auto">

      {/* ── Header ── */}
      <div className="flex justify-between items-end">
        <div>
          <div className="text-muted text-[13px] mb-2 font-medium">
            {new Date().toLocaleDateString('pl-PL', { weekday:'long', day:'numeric', month:'long', year:'numeric' })}
          </div>
          <h1 className="text-white text-4xl font-extrabold leading-tight">
            {greeting}, <span className="bg-linear-to-r from-[#c4baff] to-[#e879a0] bg-clip-text text-transparent">{firstName}</span> <span className="text-accent/80">✦</span>
          </h1>
          <div className="text-muted text-sm mt-2 font-medium">
            Masz <strong className="text-accent underline decoration-accent/20 underline-offset-4">{sleepLogs.length + moodLogs.length + dreamLogs.length}</strong> wpisów w dzienniku
          </div>
        </div>
        <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-accent to-pink flex items-center justify-center text-2xl font-black text-white shadow-[0_0_30px_rgba(124,106,245,0.4)] border border-white/20 transition-transform hover:scale-105 cursor-pointer">
          {(user?.displayName?.[0] ?? '?').toUpperCase()}
        </div>
      </div>

      {/* ── Quick actions ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {[
          { to:'/new-entry', icon:'😴', label:'Dodaj sen',    sub:'Zapisz noc',        grad:'from-accent/20 to-accent/5', glow:'shadow-glow-purple', border:'border-accent/30' },
          { to:'/new-entry', icon:'🌈', label:'Zapisz nastrój', sub:'Jak się czujesz?', grad:'from-teal/20 to-teal/5',     glow:'shadow-[0_0_20px_rgba(34,211,238,0.2)]', border:'border-teal/30' },
          { to:'/new-entry', icon:'🌙', label:'Opisz sen',    sub:'Zanim zapomnisz',   grad:'from-gold/20 to-gold/5',     glow:'shadow-[0_0_20px_rgba(244,168,50,0.2)]', border:'border-gold/30' },
        ].map((a, i) => (
          <Link key={i} to={a.to} className="no-underline group">
            <div className={`glass bg-linear-to-br ${a.grad} ${a.border} p-6 rounded-3xl transition-all duration-300 group-hover:-translate-y-1.5 group-hover:shadow-2xl ${a.glow}`}>
              <div className="text-4xl mb-4 grayscale group-hover:grayscale-0 transition-all duration-300 transform group-hover:scale-110 origin-left">{a.icon}</div>
              <div className="text-white font-bold text-[15px]">{a.label}</div>
              <div className="text-muted/70 text-sm mt-1 font-medium">{a.sub}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* ── 3-column grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Moon */}
        <div className="glass card-hover rounded-3xl overflow-hidden group">
          <div className="p-6">
            <CardHeader label="Stan kosmosu" />
            {ctxLoading ? (
              <div className="text-muted text-sm animate-pulse">Pobieranie…</div>
            ) : context?.moonData ? (
              <>
                <div className="text-center py-4 relative">
                  <div className="absolute inset-0 bg-gold/5 blur-3xl rounded-full scale-150 group-hover:bg-gold/10 transition-colors"></div>
                  <div className="text-6xl relative z-10 drop-shadow-[0_0_20px_rgba(244,168,50,0.5)] transform group-hover:scale-110 transition-transform duration-500">
                    {MOON_EMOJI[context.moonData.phase] ?? '🌙'}
                  </div>
                  <div className="text-white font-bold text-xl mt-4 relative z-10 tracking-tight">
                    {MOON_PL[context.moonData.phase] ?? '—'}
                  </div>
                  <div className="text-muted text-sm mt-1 relative z-10 font-medium italic">
                    Oświetlenie: <span className="text-gold font-bold">{context.moonData.illuminationPercent?.toFixed(0) ?? '?'}%</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 mt-4">
                  {[
                    { icon:'🌅', label:'Wschód', val: context.sunrise ?? '—' },
                    { icon:'🌇', label:'Zachód',  val: context.sunset  ?? '—' },
                  ].map((r, i) => (
                    <div key={i} className="bg-white/5 rounded-2xl p-3 border border-white/5 group-hover:border-white/10 transition-colors">
                      <div className="text-xl mb-1">{r.icon}</div>
                      <div className="text-muted text-[10px] uppercase font-bold tracking-wider">{r.label}</div>
                      <div className="text-[#f0eeff] font-bold text-[13px] mt-0.5">{r.val}</div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-muted text-sm italic">Brak danych</div>
            )}
          </div>
        </div>

        {/* Weather / Biomet */}
        <div className="glass card-hover rounded-3xl overflow-hidden">
          <div className="p-6">
            <CardHeader label="Biomet" />
            {ctxLoading ? (
              <div className="text-muted text-sm animate-pulse">Pobieranie…</div>
            ) : context?.weatherData ? (() => {
              const p = context.weatherData.pressureHpa;
              const sleepScore = p > 1013 ? 'Dobre warunki' : p > 1000 ? 'Umiarkowane' : 'Niskie ciśnienie';
              const sleepColor = p > 1013 ? 'text-teal' : p > 1000 ? 'text-gold' : 'text-pink';
              return (
                <>
                  <div className="flex flex-col gap-4 mb-6">
                    {[
                      { icon:'🌡️', label:'Temperatura',  val:`${context.weatherData.temperatureCelsius?.toFixed(1)}°C`, color:'text-teal' },
                      { icon:'🔵', label:'Ciśnienie',     val:`${p?.toFixed(0)} hPa`,                                  color: p < 1000 ? 'text-pink' : 'text-accent' },
                      { icon:'💧', label:'Wilgotność',    val:`${context.weatherData.humidity?.toFixed(0)}%`,           color:'text-accent' },
                    ].map((row, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-lg opacity-80">{row.icon}</span>
                          <span className="text-muted text-[13px] font-medium">{row.label}</span>
                        </div>
                        <span className={`${row.color} font-bold text-[15px]`}>{row.val}</span>
                      </div>
                    ))}
                  </div>
                  <div className="bg-white/5 rounded-2xl p-4 border border-white/5 text-center relative overflow-hidden group/item">
                    <div className="absolute inset-0 bg-linear-to-b from-white/5 to-transparent opacity-0 group-hover/item:opacity-100 transition-opacity"></div>
                    <div className="text-3xl mb-2 relative z-10 transition-transform group-hover/item:-translate-y-1">🌙</div>
                    <div className={`${sleepColor} font-bold text-sm relative z-10 uppercase tracking-wide`}>{sleepScore}</div>
                    <div className="text-muted/60 text-[11px] mt-1 relative z-10 font-medium">do snu tej nocy</div>
                  </div>
                </>
              );
            })() : (
              <div className="text-muted text-sm italic">Brak danych pogodowych</div>
            )}
          </div>
        </div>

        {/* Zodiac */}
        <div className="glass card-hover rounded-3xl overflow-hidden">
          <div className="p-6">
            <CardHeader label="Zodiak" extra={zodiac.dates} />
            <div className="text-center py-2">
              <div className="text-5xl mb-4 drop-shadow-[0_0_15px_rgba(232,121,160,0.4)] transform hover:scale-110 transition-transform cursor-default">
                {zodiac.emoji}
              </div>
              <div className="text-white font-bold text-xl mb-2 tracking-tight">{zodiac.name}</div>
              <div className="flex justify-center mb-6">
                <Pill color="pink">{zodiac.dates}</Pill>
              </div>
            </div>
            <div className="bg-pink/10 border border-pink/20 rounded-2xl p-4 relative group/hor">
              <div className="absolute top-2 right-3 text-pink opacity-20 group-hover/hor:opacity-40 transition-opacity">✧</div>
              <div className="text-pink/80 text-[10px] font-bold tracking-[0.15em] uppercase mb-2">Horoskop snu</div>
              <div className="text-[#d0cff0] text-[13px] leading-relaxed font-medium">{horoscope}</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom row: chart + recent entries ── */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_1.6fr] gap-6">

        {/* Sleep trend chart */}
        <div className="glass card-hover rounded-3xl overflow-hidden">
          <div className="p-6">
            <CardHeader label="Trend jakości snu" extra="ostatnie 7 nocy" />
            {sleepChartData.length < 2 ? (
              <div className="text-center py-10">
                <div className="text-4xl mb-4 grayscale opacity-50">😴</div>
                <div className="text-muted text-sm italic">Dodaj wpisy snu, by zobaczyć trend</div>
              </div>
            ) : (
              <div className="h-[140px] w-full mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={sleepChartData} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
                    <defs>
                      <linearGradient id="sleepGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#7c6af5" stopOpacity={0.5} />
                        <stop offset="95%" stopColor="#7c6af5" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="val" stroke="#7c6af5" strokeWidth={3}
                      fill="url(#sleepGrad)" dot={{ fill:'#7c6af5', r: 4, strokeWidth: 2, stroke: '#050614' }}
                      activeDot={{ r: 6, strokeWidth: 0, fill: '#fff', shadow: '0 0 10px #7c6af5' }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Mini stats */}
            <div className="grid grid-cols-3 gap-3 mt-6">
              {[
                { label:'Wpisy snu', val: sleepLogs.length, color:'text-accent', bg:'bg-accent/10' },
                { label:'Nastroje',  val: moodLogs.length,  color:'text-teal', bg:'bg-teal/10' },
                { label:'Sny',       val: dreamLogs.length, color:'text-gold', bg:'bg-gold/10' },
              ].map((s, i) => (
                <div key={i} className={`bg-white/5 border border-white/5 rounded-2xl p-3 text-center transition-transform hover:scale-105`}>
                  <div className={`${s.color} font-black text-2xl leading-none`}>{s.val}</div>
                  <div className="text-muted text-[10px] uppercase font-bold tracking-wider mt-2">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent entries */}
        <div className="glass card-hover rounded-3xl overflow-hidden flex flex-col">
          <div className="p-6 pb-2">
            <CardHeader label="Ostatnie wpisy" extra={
              <Link to="/journal" className="text-accent hover:text-white transition-colors no-underline text-xs font-bold flex items-center gap-1 group/link">
                Wszystkie <span className="group-hover:translate-x-1 transition-transform">→</span>
              </Link>
            } />
          </div>

          <div className="flex-1">
            {recentAll.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-4xl mb-4 grayscale opacity-30">📖</div>
                <div className="text-muted text-sm italic">Brak wpisów. Zacznij prowadzić dziennik!</div>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {recentAll.map((log, i) => {
                  const meta = {
                    sleep: { icon:'😴', color:'text-accent', bg:'bg-accent/10', label:'Sen',    detail: `Jakość: ${log.sleepQualityRating}/10` },
                    mood:  { icon:'🌈', color:'text-teal', bg:'bg-teal/10',  label:'Nastrój', detail: `Energia: ${log.energyLevel}/10` },
                    dream: { icon:'🌙', color:'text-gold', bg:'bg-gold/10',  label:'Zapis',     detail: log.dreamDescription?.slice(0, 50) + (log.dreamDescription?.length > 50 ? '…' : '') },
                  }[log.type];
                  return (
                    <div key={log.id ?? i}
                      className="group/item flex items-center gap-4 px-6 py-4 hover:bg-white/3 transition-colors cursor-pointer"
                    >
                      <div className={`w-11 h-11 rounded-xl shadow-inner ${meta.bg} flex items-center justify-center text-xl shrink-0 group-hover/item:scale-110 transition-transform`}>
                        {meta.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-white font-bold text-sm">{log.date}</span>
                          <Pill color={log.type === 'sleep' ? 'accent' : log.type === 'mood' ? 'teal' : 'gold'}>{meta.label}</Pill>
                          {log.hadNightmares && <Pill color="pink">Koszmar</Pill>}
                        </div>
                        <div className="text-muted text-xs font-medium truncate opacity-70 group-hover/item:opacity-100 transition-opacity">
                          {meta.detail}
                        </div>
                      </div>
                      <div className="text-white/10 group-hover/item:text-accent transition-colors text-xl font-light pl-2">
                        <span className="transform group-hover/item:translate-x-1 inline-block transition-transform">›</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Footer ── */}
      <footer className="mt-12 pt-8 border-t border-white/5 text-center flex flex-col items-center gap-4">
        <div className="flex items-center gap-6">
          {['Privacy', 'Terms', 'Support'].map(item => (
            <a key={item} href="#" className="text-muted/60 hover:text-accent text-[11px] font-bold tracking-widest uppercase transition-colors no-underline">{item}</a>
          ))}
        </div>
        <p className="text-muted/40 text-[10px] font-medium tracking-wide">
          © {new Date().getFullYear()} DREAM CATCHER · HOLISTIC SLEEP & MOOD TRACKING
        </p>
      </footer>

    </div>
  );
}
