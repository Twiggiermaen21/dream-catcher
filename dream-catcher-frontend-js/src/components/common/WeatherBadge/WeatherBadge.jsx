export default function WeatherBadge({ weatherData }) {
  if (!weatherData) return null;

  const { temperatureCelsius, pressureHpa, humidity } = weatherData;
  const isLowPressure = pressureHpa < 1000;

  return (
    <div className="glass px-4 py-2.5 rounded-2xl flex items-center gap-5 shadow-lg border-white/5 bg-white/3">
      <div className="flex items-center gap-2 group" title="Temperatura">
        <span className="text-pink drop-shadow-[0_0_8px_rgba(232,121,160,0.4)] group-hover:scale-110 transition-transform">🌡️</span>
        <span className="text-white text-xs font-black tracking-tight">{temperatureCelsius?.toFixed(1)}°C</span>
      </div>
      
      <div className="flex items-center gap-2 group" title="Ciśnienie">
        <span className="text-teal drop-shadow-[0_0_8px_rgba(34,211,238,0.4)] group-hover:scale-110 transition-transform">⏲️</span>
        <span className={`text-xs font-black tracking-tight ${isLowPressure ? 'text-pink' : 'text-white'}`}>
          {pressureHpa?.toFixed(0)} <span className="text-[10px] opacity-60">hPa</span> {isLowPressure && '↓'}
        </span>
      </div>
      
      <div className="flex items-center gap-2 group" title="Wilgotność">
        <span className="text-accent drop-shadow-[0_0_8px_rgba(124,106,245,0.4)] group-hover:scale-110 transition-transform">💧</span>
        <span className="text-white text-xs font-black tracking-tight">{humidity?.toFixed(0)}%</span>
      </div>
    </div>
  );
}
