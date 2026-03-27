import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SleepLogForm from '../../components/logs/SleepLogForm/SleepLogForm';
import MoodLogForm  from '../../components/logs/MoodLogForm/MoodLogForm';
import DreamLogForm from '../../components/logs/DreamLogForm/DreamLogForm';

const TABS = [
  { key: 'sleep', label: '😴 Sen' },
  { key: 'mood',  label: '🌈 Nastrój' },
  { key: 'dream', label: '🌙 Marzenie senne' },
];

const ZODIAC_SIGN = 'aries';

export default function NewEntry() {
  const [activeTab, setActiveTab] = useState('sleep');
  const navigate = useNavigate();

  const onSuccess = () => navigate('/journal');

  return (
    <div style={{ padding: 24, maxWidth: 700, margin: '0 auto' }}>
      <h2>Nowy wpis</h2>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 24, borderBottom: '2px solid #dee2e6' }}>
        {TABS.map((tab) => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
            padding: '10px 20px',
            border: 'none',
            borderBottom: activeTab === tab.key ? '2px solid #6f42c1' : '2px solid transparent',
            background: 'transparent',
            fontWeight: activeTab === tab.key ? 700 : 400,
            color: activeTab === tab.key ? '#6f42c1' : '#6c757d',
            cursor: 'pointer',
            fontSize: 15,
            marginBottom: -2,
          }}>
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'sleep' && <SleepLogForm zodiacSign={ZODIAC_SIGN} onSuccess={onSuccess} />}
      {activeTab === 'mood'  && <MoodLogForm  zodiacSign={ZODIAC_SIGN} onSuccess={onSuccess} />}
      {activeTab === 'dream' && <DreamLogForm zodiacSign={ZODIAC_SIGN} onSuccess={onSuccess} />}
    </div>
  );
}
