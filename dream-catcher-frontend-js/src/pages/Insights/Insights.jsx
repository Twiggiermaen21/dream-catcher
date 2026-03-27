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
    <div className="px-3 py-2 rounded-xl text-xs"
      style={{ background: '#1a1b30', border: '1px solid rgba(255,255,255,0.1)', color: '#f0eeff' }}>
      {payload[0].value.toFixed(2)}
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
    <div className="flex flex-col gap-4">

      {/* Header card */}
      <div className="rounded-2xl px-5 py-4 flex items-center justify-between" style={card}>
        <div>
          <div className="text-sm font-semibold text-white">Insights Engine</div>
          <div className="text-xs mt-0.5" style={{ color: '#8b8aaa' }}>Korelacje środowiska z Twoim samopoczuciem</div>
        </div>
        <div className="flex gap-1.5">
          {PERIODS.map(p => (
            <button key={p.value} onClick={() => setPeriod(p.value)}
              className="px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-all border-none"
              style={period === p.value
                ? { background: 'rgba(124,106,245,0.25)', color: '#c4baff', boxShadow: 'inset 0 0 0 1px rgba(124,106,245,0.4)' }
                : { background: 'rgba(255,255,255,0.05)', color: '#8b8aaa', boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.08)' }
              }>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <div className="rounded-2xl px-5 py-10 text-center text-sm" style={{ ...card, color: '#8b8aaa' }}>
          Obliczam korelacje…
        </div>
      )}
      {error && (
        <div className="rounded-2xl px-5 py-4 text-sm" style={{ ...card, color: '#fca5a5' }}>
          Błąd: {error}
        </div>
      )}

      {!loading && insights.length === 0 && (
        <div className="rounded-2xl px-5 py-16 text-center" style={card}>
          <div className="text-4xl mb-4">✧</div>
          <div className="text-sm font-semibold text-white mb-1">Za mało danych</div>
          <div className="text-xs" style={{ color: '#8b8aaa' }}>Potrzebujesz co najmniej 5 wpisów, aby zobaczyć korelacje.</div>
        </div>
      )}

      {insights.length > 0 && (
        <>
          {/* Chart */}
          <div className="rounded-2xl px-5 pt-5 pb-4" style={card}>
            <div className="text-sm font-semibold text-white mb-4">Wizualizacja korelacji</div>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={chartData} layout="vertical">
                <XAxis type="number" domain={[-1, 1]} tick={{ fontSize: 11, fill: '#8b8aaa' }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} tickLine={false} />
                <YAxis type="category" dataKey="name" width={200} tick={{ fontSize: 11, fill: '#8b8aaa' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="coeff" radius={4}>
                  {chartData.map(entry => (
                    <Cell key={entry.name} fill={entry.coeff < 0 ? '#e879a0' : '#7c6af5'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Insight cards */}
          <div className="rounded-2xl overflow-hidden" style={card}>
            {insights.map((insight, i) => {
              const strength = Math.abs(insight.correlationCoeff);
              const isNeg    = insight.correlationCoeff < 0;
              const barColor = strength > 0.5 ? (isNeg ? '#e879a0' : '#7c6af5') : '#2a2b45';
              return (
                <div key={i} className="flex flex-col gap-2.5 px-5 py-4"
                  style={{ borderBottom: i < insights.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2 text-sm font-medium text-white">
                      <span className="text-xl">{FACTOR_ICON[insight.factor] ?? '✧'}</span>
                      {insight.factor.replace('_', ' ')} → {insight.metric.replace('_', ' ')}
                    </div>
                    <span className="text-xs" style={{ color: '#8b8aaa' }}>próbka: {insight.sampleSize}</span>
                  </div>
                  <div className="text-xs" style={{ color: '#8b8aaa' }}>{insight.insight}</div>
                  <div className="flex items-center gap-2.5">
                    <div className="flex-1 h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
                      <div className="h-full rounded-full transition-all"
                        style={{ width: `${strength * 100}%`, background: barColor }} />
                    </div>
                    <span className="text-xs font-semibold w-9" style={{ color: barColor }}>
                      {insight.correlationCoeff.toFixed(2)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
