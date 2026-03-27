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
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">

      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-100">
        <div className="text-sm font-semibold text-gray-900">Nowy wpis</div>
        <div className="text-xs text-gray-400 mt-0.5">
          {new Date().toLocaleDateString('pl-PL', { weekday: 'long', day: 'numeric', month: 'long' })}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex px-2 border-b border-gray-100">
        {TABS.map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-1.5 px-4 py-3 text-sm border-none bg-transparent cursor-pointer transition-colors -mb-px
              ${activeTab === tab.key
                ? 'font-semibold text-gray-900 border-b-2 border-gray-900'
                : 'font-normal text-gray-400 hover:text-gray-600 border-b-2 border-transparent'}`}>
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
