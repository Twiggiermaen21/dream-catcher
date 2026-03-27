export default function WeatherBadge({ weatherData }) {
  if (!weatherData) return null;

  const { temperatureCelsius, pressureHpa, humidity } = weatherData;
  const isLowPressure = pressureHpa < 1000;

  return (
    <div style={{
      display: 'flex',
      gap: 16,
      padding: '8px 16px',
      borderRadius: 12,
      background: isLowPressure ? '#fff3cd' : '#d1ecf1',
      fontSize: 14,
    }}>
      <span title="Temperatura">🌡️ {temperatureCelsius?.toFixed(1)}°C</span>
      <span title="Ciśnienie" style={{ color: isLowPressure ? '#856404' : 'inherit' }}>
        🔵 {pressureHpa?.toFixed(0)} hPa {isLowPressure && '↓'}
      </span>
      <span title="Wilgotność">💧 {humidity?.toFixed(0)}%</span>
    </div>
  );
}
