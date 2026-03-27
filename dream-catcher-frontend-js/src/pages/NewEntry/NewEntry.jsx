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
    <div className="glass rounded-3xl overflow-hidden max-w-2xl mx-auto shadow-2xl relative">
      <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none text-6xl">
        {TABS.find(t => t.key === activeTab)?.icon}
      </div>

      {/* Header */}
      <div className="px-8 py-6 border-b border-white/5 bg-white/2">
        <div className="text-white text-lg font-bold tracking-tight uppercase tracking-widest text-xs opacity-60 mb-1">Nowy wpis</div>
        <div className="text-white text-2xl font-black">
          {new Date().toLocaleDateString('pl-PL', { weekday: 'long', day: 'numeric', month: 'long' })}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex px-4 border-b border-white/5 bg-white/1">
        {TABS.map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`
              flex items-center gap-2 px-6 py-4 text-sm font-bold tracking-wide border-none bg-transparent cursor-pointer transition-all relative
              ${activeTab === tab.key ? 'text-white' : 'text-muted hover:text-white/70'}
            `}>
            {tab.icon} {tab.label}
            {activeTab === tab.key && (
              <div className="absolute bottom-0 left-4 right-4 h-0.5 bg-accent shadow-glow-purple rounded-full"></div>
            )}
          </button>
        ))}
      </div>

      {/* Form */}
      <div className="p-8">
        <div className="bg-white/3 rounded-2xl p-0.5 mb-2">
          {activeTab === 'sleep' && <SleepLogForm onSuccess={() => navigate('/journal')} />}
          {activeTab === 'mood'  && <MoodLogForm  onSuccess={() => navigate('/journal')} />}
          {activeTab === 'dream' && <DreamLogForm onSuccess={() => navigate('/journal')} />}
        </div>
      </div>
    </div>
  );
}
