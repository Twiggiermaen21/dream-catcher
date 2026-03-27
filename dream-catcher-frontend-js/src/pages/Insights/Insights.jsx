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
    <div className="flex flex-col gap-4">

      {/* Header card */}
      <div className="bg-white rounded-2xl shadow-sm px-5 py-4 flex items-center justify-between">
        <div>
          <div className="text-sm font-semibold text-gray-900">Insights Engine</div>
          <div className="text-xs text-gray-400 mt-0.5">Korelacje środowiska z Twoim samopoczuciem</div>
        </div>
        <div className="flex gap-1.5">
          {PERIODS.map(p => (
            <button key={p.value} onClick={() => setPeriod(p.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border cursor-pointer transition-colors
                ${period === p.value
                  ? 'bg-gray-900 text-white border-gray-900'
                  : 'bg-transparent text-gray-500 border-gray-200 hover:border-gray-400'}`}>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <div className="bg-white rounded-2xl shadow-sm px-5 py-10 text-center text-sm text-gray-400">
          Obliczam korelacje…
        </div>
      )}
      {error && (
        <div className="bg-white rounded-2xl shadow-sm px-5 py-4 text-sm text-red-600">
          Błąd: {error}
        </div>
      )}

      {!loading && insights.length === 0 && (
        <div className="bg-white rounded-2xl shadow-sm px-5 py-16 text-center">
          <div className="text-4xl mb-4">📊</div>
          <div className="text-sm font-semibold text-gray-900 mb-1">Za mało danych</div>
          <div className="text-xs text-gray-400">Potrzebujesz co najmniej 5 wpisów, aby zobaczyć korelacje.</div>
        </div>
      )}

      {insights.length > 0 && (
        <>
          {/* Chart */}
          <div className="bg-white rounded-2xl shadow-sm px-5 pt-5 pb-4">
            <div className="text-sm font-semibold text-gray-900 mb-4">Wizualizacja korelacji</div>
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

          {/* Insight cards */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            {insights.map((insight, i) => {
              const strength = Math.abs(insight.correlationCoeff);
              const isNeg = insight.correlationCoeff < 0;
              const barColor = strength > 0.5 ? (isNeg ? '#f87171' : '#4ade80') : '#e5e7eb';
              return (
                <div key={i} className="flex flex-col gap-2.5 px-5 py-4 border-b border-gray-100 last:border-none">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
                      <span className="text-xl">{FACTOR_ICON[insight.factor] ?? '📊'}</span>
                      {insight.factor.replace('_', ' ')} → {insight.metric.replace('_', ' ')}
                    </div>
                    <span className="text-xs text-gray-400">próbka: {insight.sampleSize}</span>
                  </div>
                  <div className="text-xs text-gray-500">{insight.insight}</div>
                  <div className="flex items-center gap-2.5">
                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${strength * 100}%`, background: barColor }}
                      />
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
