const PHASE_EMOJI = {
  NEW_MOON:        '🌑',
  WAXING_CRESCENT: '🌒',
  FIRST_QUARTER:   '🌓',
  WAXING_GIBBOUS:  '🌔',
  FULL_MOON:       '🌕',
  WANING_GIBBOUS:  '🌖',
  LAST_QUARTER:    '🌗',
  WANING_CRESCENT: '🌘',
};

const PHASE_LABEL = {
  NEW_MOON:        'Nów',
  WAXING_CRESCENT: 'Sierp rosnący',
  FIRST_QUARTER:   'Pierwsza kwadra',
  WAXING_GIBBOUS:  'Garb rosnący',
  FULL_MOON:       'Pełnia',
  WANING_GIBBOUS:  'Garb malejący',
  LAST_QUARTER:    'Ostatnia kwadra',
  WANING_CRESCENT: 'Sierp malejący',
};

export default function MoonPhaseIcon({ phase, illumination, size = 32 }) {
  const emoji = PHASE_EMOJI[phase] ?? '🌙';
  const label = PHASE_LABEL[phase] ?? phase;

  return (
    <div className="flex items-center gap-3 group px-1" title={label}>
      <span className="shrink-0 drop-shadow-glow-purple group-hover:scale-110 transition-transform cursor-default" style={{ fontSize: size }}>
        {emoji}
      </span>
      <div className="flex flex-col">
        <div className="text-white text-sm font-black tracking-tight uppercase tracking-widest text-[11px] opacity-80 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          {label}
        </div>
        {illumination != null && (
          <div className="text-muted text-[10px] font-bold tracking-widest uppercase opacity-60">
            {illumination.toFixed(0)}% ILluminacji
          </div>
        )}
      </div>
    </div>
  );
}
