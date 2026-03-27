import { useState } from 'react';
import { useInsights } from '../../hooks/useInsights';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const PERIODS = [
  { value: 7,  label: '7 dni' },
  { value: 30, label: '30 dni' },
  { value: 90, label: '90 dni' },
];

const FACTOR_ICON = { FULL_MOON: '🌕', LOW_PRESSURE: '🔵', HIGH_PRESSURE: '🟡', TEMPERATURE: '🌡️' };

const card = { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', backdropFilter: 'blur(12px)' };

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass px-4 py-2 rounded-xl text-xs font-bold border-white/10 shadow-glow-purple">
      <span className="text-white">{payload[0].value.toFixed(2)}</span>
    </div>
  );
};

export default function Insights() {
  const [period, setPeriod] = useState(30);
  const { insights, loading, error } = useInsights(period);

  const chartData = insights.map(i => ({
    name: `${i.factor.replace('_', ' ')} → ${i.metric.replace('_', ' ')}`,
    coeff: parseFloat(i.correlationCoeff.toFixed(2)),
  }));

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto">

      {/* Header card */}
      <div className="glass rounded-3xl px-8 py-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
        <div>
          <div className="text-white text-2xl font-black mb-1">Insights Engine</div>
          <div className="text-muted text-sm font-medium">Inteligentna analiza korelacji środowiska z Twoim snem</div>
        </div>
        <div className="flex gap-2 bg-white/5 p-1.5 rounded-2xl border border-white/5">
          {PERIODS.map(p => (
            <button key={p.value} onClick={() => setPeriod(p.value)}
              className={`
                px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest cursor-pointer transition-all border-none
                ${period === p.value
                  ? 'bg-accent text-white shadow-glow-purple scale-105'
                  : 'bg-transparent text-muted hover:text-white/70 hover:bg-white/5'
                }`}>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <div className="glass rounded-3xl px-8 py-20 text-center flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-accent/30 border-t-accent rounded-full animate-spin"></div>
          <div className="text-muted text-sm font-bold tracking-widest uppercase animate-pulse">Analizowanie konstelacji danych…</div>
        </div>
      )}

      {error && (
        <div className="glass rounded-3xl px-8 py-6 text-center border-pink/20">
          <div className="text-pink text-sm font-bold">Błąd systemu: {error}</div>
        </div>
      )}

      {!loading && insights.length === 0 && (
        <div className="glass rounded-3xl px-8 py-24 text-center">
          <div className="text-6xl mb-6 grayscale opacity-20 transform rotate-12 transition-transform hover:rotate-0">🔭</div>
          <div className="text-white text-xl font-black mb-2">Horyzont zdarzeń zbyt blisko</div>
          <div className="text-muted text-sm font-medium italic">Potrzebujesz co najmniej 5 wpisów, aby algorytm mógł dostrzec wzorce.</div>
        </div>
      )}

      {!loading && insights.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Chart Container */}
          <div className="glass rounded-3xl p-8 flex flex-col shadow-xl">
            <div className="flex items-center justify-between mb-8">
              <div className="text-white text-lg font-black uppercase tracking-tight">Wizualizacja korelacji</div>
              <div className="flex gap-2">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-accent"></div>
                  <span className="text-[10px] font-bold text-muted uppercase">Dodatnia</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-pink"></div>
                  <span className="text-[10px] font-bold text-muted uppercase">Ujemna</span>
                </div>
              </div>
            </div>
            
            <div className="flex-1 min-h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical" margin={{ left: 20 }}>
                  <XAxis type="number" domain={[-1, 1]} hide />
                  <YAxis type="category" dataKey="name" width={150} tick={{ fontSize: 10, fill: '#8b8aaa', fontWeight: 700 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                  <Bar dataKey="coeff" radius={[0, 4, 4, 0]} barSize={20}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.coeff < 0 ? '#e879a0' : '#7c6af5'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Insight cards */}
          <div className="glass rounded-3xl overflow-hidden flex flex-col shadow-xl divide-y divide-white/5">
            {insights.map((insight, i) => {
              const strength = Math.abs(insight.correlationCoeff);
              const isNeg    = insight.correlationCoeff < 0;
              const barColor = isNeg ? 'bg-pink shadow-[0_0_15px_rgba(232,121,160,0.3)]' : 'bg-accent shadow-[0_0_15px_rgba(124,106,245,0.3)]';
              const textColor = isNeg ? 'text-pink' : 'text-accent';
              
              return (
                <div key={i} className="group p-6 hover:bg-white/2 transition-all">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                        {FACTOR_ICON[insight.factor] ?? '✧'}
                      </div>
                      <div>
                        <div className="text-white text-[13px] font-black uppercase tracking-tight">
                          {insight.factor.replace('_', ' ')} <span className="text-muted opacity-40 mx-1">→</span> {insight.metric.replace('_', ' ')}
                        </div>
                        <div className="text-muted text-[10px] font-bold uppercase tracking-widest opacity-60">Próbka danych: {insight.sampleSize}</div>
                      </div>
                    </div>
                    <div className={`${textColor} text-lg font-black tracking-tighter`}>
                      {insight.correlationCoeff > 0 ? '+' : ''}{insight.correlationCoeff.toFixed(2)}
                    </div>
                  </div>
                  
                  <div className="text-muted/80 text-xs font-medium leading-relaxed mb-5 italic border-l-2 border-white/5 pl-4 ml-1">
                    {insight.insight}
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-1000 ${barColor}`}
                        style={{ width: `${strength * 100}%` }} />
                    </div>
                    <div className="text-[10px] font-black text-muted uppercase tracking-widest w-12 text-right">
                      {Math.round(strength * 100)}%
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
