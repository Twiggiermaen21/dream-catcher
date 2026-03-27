import { useState } from 'react';
import { useInsights } from '../../hooks/useInsights';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const PERIODS = [
  { value: 7,  label: '7 dni' },
  { value: 30, label: '30 dni' },
  { value: 90, label: '90 dni' },
];

const FACTOR_ICON = { FULL_MOON: '🌕', LOW_PRESSURE: '🔵', HIGH_PRESSURE: '🟡', TEMPERATURE: '🌡️' };

export default function Insights() {
  const [period, setPeriod] = useState(30);
  const { insights, loading, error } = useInsights(period);

  const chartData = insights.map(i => ({
    name: `${i.factor.replace('_', ' ')} → ${i.metric.replace('_', ' ')}`,
    coeff: parseFloat(i.correlationCoeff.toFixed(2)),
  }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Header card */}
      <div className="card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontWeight: 600, fontSize: 15 }}>Insights Engine</div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>Korelacje środowiska z Twoim samopoczuciem</div>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {PERIODS.map(p => (
            <button key={p.value} onClick={() => setPeriod(p.value)}
              className={`tag${period === p.value ? ' active' : ''}`}>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {loading && <div className="card" style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>Obliczam korelacje…</div>}
      {error   && <div className="card" style={{ padding: 20, color: '#dc2626', fontSize: 13 }}>Błąd: {error}</div>}

      {!loading && insights.length === 0 && (
        <div className="card" style={{ padding: 64, textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>📊</div>
          <div style={{ fontWeight: 600, marginBottom: 8 }}>Za mało danych</div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            Potrzebujesz co najmniej 5 wpisów, aby zobaczyć korelacje.
          </div>
        </div>
      )}

      {insights.length > 0 && (
        <>
          {/* Wykres */}
          <div className="card" style={{ padding: '20px 20px 16px' }}>
            <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 16 }}>Wizualizacja korelacji</div>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={chartData} layout="vertical">
                <XAxis type="number" domain={[-1, 1]} tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="name" width={200} tick={{ fontSize: 11 }} />
                <Tooltip formatter={v => v.toFixed(2)} />
                <Bar dataKey="coeff" radius={4}>
                  {chartData.map(entry => (
                    <Cell key={entry.name} fill={entry.coeff < 0 ? '#f87171' : '#4ade80'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Karty */}
          <div className="card" style={{ overflow: 'hidden' }}>
            {insights.map((insight, i) => {
              const strength = Math.abs(insight.correlationCoeff);
              const isNeg = insight.correlationCoeff < 0;
              const barColor = strength > 0.5 ? (isNeg ? '#f87171' : '#4ade80') : 'var(--border)';
              return (
                <div key={i} className="list-item" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 10, cursor: 'default' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 500, fontSize: 14 }}>
                      <span style={{ fontSize: 20 }}>{FACTOR_ICON[insight.factor] ?? '📊'}</span>
                      {insight.factor.replace('_', ' ')} → {insight.metric.replace('_', ' ')}
                    </div>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>próbka: {insight.sampleSize}</span>
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{insight.insight}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%' }}>
                    <div style={{ flex: 1, height: 6, background: 'var(--bg-hover)', borderRadius: 3 }}>
                      <div style={{ width: `${strength * 100}%`, height: '100%', background: barColor, borderRadius: 3 }} />
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 600, color: barColor, width: 36 }}>
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
