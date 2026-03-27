import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SleepLogForm from '../../components/logs/SleepLogForm/SleepLogForm';
import MoodLogForm  from '../../components/logs/MoodLogForm/MoodLogForm';
import DreamLogForm from '../../components/logs/DreamLogForm/DreamLogForm';

const TABS = [
  { key: 'sleep', icon: '😴', label: 'Sen' },
  { key: 'mood',  icon: '🌈', label: 'Nastrój' },
  { key: 'dream', icon: '🌙', label: 'Marzenie senne' },
];

export default function NewEntry() {
  const [activeTab, setActiveTab] = useState('sleep');
  const navigate = useNavigate();

  return (
    <div className="card" style={{ overflow: 'hidden' }}>

      {/* Header */}
      <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ fontWeight: 600, fontSize: 15 }}>Nowy wpis</div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
          {new Date().toLocaleDateString('pl-PL', { weekday: 'long', day: 'numeric', month: 'long' })}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', padding: '0 8px' }}>
        {TABS.map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '12px 16px', border: 'none', background: 'transparent',
            fontSize: 13, fontWeight: activeTab === tab.key ? 600 : 400,
            color: activeTab === tab.key ? 'var(--text-primary)' : 'var(--text-muted)',
            borderBottom: activeTab === tab.key ? '2px solid var(--text-primary)' : '2px solid transparent',
            marginBottom: -1, cursor: 'pointer',
          }}>
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Form */}
      <div style={{ padding: 24 }}>
        {activeTab === 'sleep' && <SleepLogForm onSuccess={() => navigate('/journal')} />}
        {activeTab === 'mood'  && <MoodLogForm  onSuccess={() => navigate('/journal')} />}
        {activeTab === 'dream' && <DreamLogForm onSuccess={() => navigate('/journal')} />}
      </div>
    </div>
  );
}
