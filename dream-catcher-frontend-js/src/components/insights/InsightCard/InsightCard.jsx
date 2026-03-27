const FACTOR_ICON = {
  FULL_MOON:    '🌕',
  LOW_PRESSURE: '🔵',
  HIGH_PRESSURE:'🟡',
  TEMPERATURE:  '🌡️',
};

export default function InsightCard({ insight }) {
  const { factor, metric, correlationCoeff, insight: text, sampleSize } = insight;

  const strength = Math.abs(correlationCoeff);
  const isNegative = correlationCoeff < 0;

  const barColor = strength > 0.5
    ? (isNegative ? '#dc3545' : '#28a745')
    : '#6c757d';

  return (
    <div style={{
      border: '1px solid #dee2e6',
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      background: '#fff',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <span style={{ fontSize: 18 }}>
          {FACTOR_ICON[factor] ?? '📊'} {factor.replace('_', ' ')}
        </span>
        <span style={{ fontSize: 12, color: '#6c757d' }}>
          próbka: {sampleSize} nocy
        </span>
      </div>

      <p style={{ margin: '4px 0 12px', color: '#212529' }}>{text}</p>

      {/* Pasek korelacji */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 12, width: 80, color: '#6c757d' }}>
          korelacja
        </span>
        <div style={{ flex: 1, background: '#e9ecef', borderRadius: 4, height: 8 }}>
          <div style={{
            width: `${strength * 100}%`,
            background: barColor,
            borderRadius: 4,
            height: '100%',
          }} />
        </div>
        <span style={{ fontSize: 12, width: 40, color: barColor, fontWeight: 600 }}>
          {correlationCoeff.toFixed(2)}
        </span>
      </div>
    </div>
  );
}
