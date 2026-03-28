import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import SleepLogForm from '../../components/logs/SleepLogForm/SleepLogForm';
import MoodLogForm  from '../../components/logs/MoodLogForm/MoodLogForm';
import DreamLogForm from '../../components/logs/DreamLogForm/DreamLogForm';

const TABS = [
  { key: 'sleep', icon: '😴', label: 'Sen' },
  { key: 'mood',  icon: '🌈', label: 'Nastrój' },
  { key: 'dream', icon: '🌙', label: 'Marzenie senne' },
];

export default function NewEntry() {
  const navigate = useNavigate();
  const { state } = useLocation();

  const editState = state?.editing ? state : null;
  const [activeTab, setActiveTab] = useState(editState?.type ?? 'sleep');

  const onSuccess = () => navigate('/journal');

  return (
    <div className="glass rounded-3xl overflow-hidden max-w-2xl mx-auto shadow-2xl relative">
      <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none text-6xl">
        {TABS.find(t => t.key === activeTab)?.icon}
      </div>

      {/* Header */}
      <div className="px-8 py-6 border-b border-white/5 bg-white/2">
        <div className="text-white text-xs font-bold uppercase tracking-widest opacity-60 mb-1">
          {editState ? 'Edytuj wpis' : 'Nowy wpis'}
        </div>
        <div className="text-white text-2xl font-black">
          {new Date().toLocaleDateString('pl-PL', { weekday: 'long', day: 'numeric', month: 'long' })}
        </div>
      </div>

      {/* Tabs — hidden when editing (type is fixed) */}
      {!editState && (
        <div className="flex px-4 border-b border-white/5 bg-white/1">
          {TABS.map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-bold tracking-wide border-none bg-transparent cursor-pointer transition-all relative ${
                activeTab === tab.key ? 'text-white' : 'text-muted hover:text-white/70'
              }`}>
              {tab.icon} {tab.label}
              {activeTab === tab.key && (
                <div className="absolute bottom-0 left-4 right-4 h-0.5 bg-accent shadow-glow-purple rounded-full" />
              )}
            </button>
          ))}
        </div>
      )}

      {/* Form */}
      <div className="mx-8 my-7">
        {activeTab === 'sleep' && (
          <SleepLogForm onSuccess={onSuccess}
            editingLog={editState?.type === 'sleep' ? editState.log : null} />
        )}
        {activeTab === 'mood' && (
          <MoodLogForm onSuccess={onSuccess}
            editingLog={editState?.type === 'mood' ? editState.log : null} />
        )}
        {activeTab === 'dream' && (
          <DreamLogForm onSuccess={onSuccess}
            editingLog={editState?.type === 'dream' ? editState.log : null} />
        )}
      </div>
    </div>
  );
}
