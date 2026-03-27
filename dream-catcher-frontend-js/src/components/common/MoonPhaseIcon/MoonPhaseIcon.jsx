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
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }} title={label}>
      <span style={{ fontSize: size }}>{emoji}</span>
      <div>
        <div style={{ fontWeight: 600 }}>{label}</div>
        {illumination != null && (
          <div style={{ fontSize: 12, color: '#888' }}>
            {illumination.toFixed(0)}% oświetlenia
          </div>
        )}
      </div>
    </div>
  );
}
