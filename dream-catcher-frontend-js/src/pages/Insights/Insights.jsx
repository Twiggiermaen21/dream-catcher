import { useState } from 'react';
import { useInsights }  from '../../hooks/useInsights';
import InsightCard      from '../../components/insights/InsightCard/InsightCard';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';

const PERIOD_OPTIONS = [
  { value: 7,  label: '7 dni' },
  { value: 30, label: '30 dni' },
  { value: 90, label: '90 dni' },
];

export default function Insights() {
  const [period, setPeriod] = useState(30);
  const { insights, loading, error } = useInsights(period);

  const chartData = insights.map((i) => ({
    name: `${i.factor} → ${i.metric}`,
    coeff: parseFloat(i.correlationCoeff.toFixed(2)),
  }));

  return (
    <div style={{ padding: 24, maxWidth: 900, margin: '0 auto' }}>
      <h2>📊 Insights Engine</h2>
      <p style={{ color: '#6c757d' }}>Korelacje między środowiskiem a Twoim samopoczuciem</p>

      {/* Selektor okresu */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {PERIOD_OPTIONS.map((opt) => (
          <button key={opt.value} onClick={() => setPeriod(opt.value)} style={{
            padding: '6px 16px',
            borderRadius: 20,
            border: '1px solid',
            borderColor: period === opt.value ? '#6f42c1' : '#dee2e6',
            background:  period === opt.value ? '#6f42c1' : 'transparent',
            color:       period === opt.value ? '#fff' : '#212529',
            cursor: 'pointer',
          }}>
            {opt.label}
          </button>
        ))}
      </div>

      {loading && <p>Obliczam korelacje…</p>}
      {error   && <p style={{ color: '#dc3545' }}>Błąd: {error}</p>}

      {!loading && insights.length === 0 && (
        <div style={{ padding: 40, textAlign: 'center', color: '#6c757d' }}>
          <p>Potrzebujesz przynajmniej 5 wpisów, aby obliczyć korelacje.</p>
          <p>Zacznij pisać dziennik! 🌙</p>
        </div>
      )}

      {insights.length > 0 && (
        <>
          {/* Wykres słupkowy */}
          <div style={{ marginBottom: 32 }}>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData} layout="vertical">
                <XAxis type="number" domain={[-1, 1]} />
                <YAxis type="category" dataKey="name" width={180} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => v.toFixed(2)} />
                <Bar dataKey="coeff" radius={4}>
                  {chartData.map((entry) => (
                    <Cell
                      key={entry.name}
                      fill={entry.coeff < 0 ? '#dc3545' : '#28a745'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Karty z opisami */}
          {insights.map((insight, i) => (
            <InsightCard key={i} insight={insight} />
          ))}
        </>
      )}
    </div>
  );
}
