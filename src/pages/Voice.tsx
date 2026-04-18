import { useState } from 'react';
import { Phone, Megaphone, FileText, Settings as SettingsIcon, Mic, Zap } from 'lucide-react';
import { useCallLogs } from '@/hooks/useCallLogs';
import RecentCallsTab from '@/components/voice/RecentCallsTab';
import CampaignsTab from '@/components/voice/CampaignsTab';
import PromptsTab from '@/components/voice/PromptsTab';
import ScenariosTab from '@/components/voice/ScenariosTab';
import SettingsTab from '@/components/voice/SettingsTab';
import LiveCallWidget from '@/components/voice/LiveCallWidget';
import VoiceAgentDialer from '@/components/voice/VoiceAgentDialer';

const tabs = [
  { key: 'live', label: 'שיחה חיה', icon: Mic },
  { key: 'calls', label: 'שיחות אחרונות', icon: Phone },
  { key: 'scenarios', label: 'תסריטים', icon: Zap },
  { key: 'campaigns', label: 'קמפיינים', icon: Megaphone },
  { key: 'prompts', label: 'תבניות שיחה', icon: FileText },
  { key: 'settings', label: 'הגדרות', icon: SettingsIcon },
];

export default function Voice() {
  const [tab, setTab] = useState('live');
  const { calls, activeCall } = useCallLogs();

  return (
    <div className="animate-fade-in pb-20">
      <h1 className="page-header">📞 Voice AI - שיחות חכמות</h1>

      <div className="flex gap-1 mb-4 overflow-x-auto pb-1 -mx-1 px-1">
        {tabs.map(t => {
          const Icon = t.icon;
          const active = tab === t.key;
          return (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
                active ? 'bg-primary text-primary-foreground shadow-md' : 'bg-muted text-muted-foreground hover:bg-muted/70'
              }`}>
              <Icon size={16} /> {t.label}
            </button>
          );
        })}
      </div>

      {tab === 'live' && <VoiceAgentDialer />}
      {tab === 'calls' && <RecentCallsTab calls={calls} />}
      {tab === 'scenarios' && <ScenariosTab />}
      {tab === 'campaigns' && <CampaignsTab />}
      {tab === 'prompts' && <PromptsTab />}
      {tab === 'settings' && <SettingsTab />}

      <LiveCallWidget call={activeCall} />
    </div>
  );
}
