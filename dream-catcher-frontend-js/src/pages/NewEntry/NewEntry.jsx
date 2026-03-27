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

const card = { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', backdropFilter: 'blur(12px)' };

export default function NewEntry() {
  const [activeTab, setActiveTab] = useState('sleep');
  const navigate = useNavigate();

  return (
    <div className="rounded-2xl overflow-hidden" style={card}>

      {/* Header */}
      <div className="px-5 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="text-sm font-semibold text-white">Nowy wpis</div>
        <div className="text-xs mt-0.5" style={{ color: '#8b8aaa' }}>
          {new Date().toLocaleDateString('pl-PL', { weekday: 'long', day: 'numeric', month: 'long' })}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex px-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        {TABS.map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className="flex items-center gap-1.5 px-4 py-3 text-sm border-none bg-transparent cursor-pointer transition-all -mb-px"
            style={activeTab === tab.key
              ? { color: '#c4baff', fontWeight: 600, borderBottom: '2px solid #7c6af5' }
              : { color: '#8b8aaa', borderBottom: '2px solid transparent' }
            }>
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Form */}
      <div className="p-6">
        {activeTab === 'sleep' && <SleepLogForm onSuccess={() => navigate('/journal')} />}
        {activeTab === 'mood'  && <MoodLogForm  onSuccess={() => navigate('/journal')} />}
        {activeTab === 'dream' && <DreamLogForm onSuccess={() => navigate('/journal')} />}
      </div>
    </div>
  );
}
