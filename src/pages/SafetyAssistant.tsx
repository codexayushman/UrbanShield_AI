import { useState, useRef, useEffect } from 'react';
import PageHeader from '@/components/PageHeader';
import FadeIn from '@/components/FadeIn';
import { DataSourceBanner } from '@/components/DataLabel';
import { EMERGENCY_NUMBERS, SAMPLE_TRUSTED_CONTACTS } from '@/data/contacts';
import { Bot, Send, Phone, UserPlus, Trash2, Shield, AlertTriangle, Lightbulb, MapPin, Zap } from 'lucide-react';
import type { ChatMessage } from '@/types';

const quickPrompts = [
  'What should I do if I see a road hazard?',
  'How do I report poor lighting in my area?',
  'What are the emergency numbers for Chandigarh?',
  'Is it safe to walk at night in Sector 35?',
];

const knowledgeBase: { keywords: string[]; response: string }[] = [
  {
    keywords: ['road hazard', 'pothole', 'road'],
    response: 'If you see a road hazard such as a pothole or waterlogging:\n\n1. Note the exact location (sector and nearest landmark)\n2. Take a photo if safe to do so\n3. Report it through the Incident Reporting page\n4. The system will flag it for municipal inspection with a risk assessment\n\nDo not attempt to fix road hazards yourself. For hazards causing immediate danger, call Traffic Police at 1073.',
  },
  {
    keywords: ['lighting', 'light', 'dark', 'street light'],
    response: 'To report poor street lighting:\n\n1. Go to Incident Reporting and select "Lighting Issue"\n2. Specify the sector and location coordinates\n3. Upload a photo showing the poorly lit area if possible\n4. Multiple reports for the same area will flag a pattern for infrastructure inspection\n\nThe system uses lighting quality as one of six risk indicators in its scoring engine.',
  },
  {
    keywords: ['emergency', 'number', 'call', 'contact', 'police', 'ambulance'],
    response: 'Emergency numbers for Chandigarh:\n\n• Police Control Room: 100\n• Ambulance: 108\n• Fire Brigade: 101\n• Women Helpline: 1091\n• Traffic Police: 1073\n• Disaster Management: 1070\n\nFor real emergencies, always call these numbers directly. Do not rely solely on this app.',
  },
  {
    keywords: ['safe', 'walk', 'night', 'sector 35', 'sector'],
    response: 'Safety assessments are based on explainable, configurable risk indicators — NOT predictions. No area can be declared "safe" or "unsafe" definitively.\n\nFor Sector 35, the demo data shows a pattern of repeated theft reports, which results in a higher risk score. However:\n\n• Missing reports do NOT mean an area is safe\n• Risk scores are demo thresholds, not validated predictions\n• Personal factors (time of day, route choice, awareness) matter greatly\n\nUse the Safe Routes page to compare routes by risk score, and always stay alert.',
  },
  {
    keywords: ['report', 'incident', 'submit', 'file'],
    response: 'To report an incident:\n\n1. Navigate to Incident Reporting from the sidebar\n2. Select the incident type (road hazard, theft, harassment, etc.)\n3. Provide a clear title and description\n4. Select the Chandigarh sector and enter location coordinates\n5. Optionally upload evidence (photos, documents)\n6. Submit — you will receive a tracking ID and immediate risk assessment\n\nAll reports in demo mode are simulated. For real emergencies, call 100.',
  },
  {
    keywords: ['camera', 'ai', 'detection', 'surveillance'],
    response: 'The AI Camera Detection page shows SIMULATED detections for demonstration:\n\n• Crowd density analysis\n• Rapid movement detection (flagged as unverified — never confirms violence)\n• Loitering detection\n\nAll detections require human review before any action is taken. The system NEVER claims to confirm violence or criminal activity from camera analysis alone.',
  },
];

function getResponse(query: string): string {
  const lower = query.toLowerCase();
  for (const kb of knowledgeBase) {
    if (kb.keywords.some(k => lower.includes(k))) {
      return kb.response;
    }
  }
  return "I can help with: road hazards, lighting issues, emergency numbers, safety guidance, incident reporting, and camera detection. Try one of the quick prompts below, or ask about a specific Chandigarh sector.\n\nNote: This is a demo assistant with limited knowledge. For real emergencies, call 100 (Police) or 108 (Ambulance).";
}

export default function SafetyAssistant() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-init',
      role: 'assistant',
      content: 'Hello! I am the UrbanShield AI Safety Assistant. I can provide grounded emergency guidance for Chandigarh. How can I help you today?\n\nNote: I am a demo assistant with limited knowledge. For real emergencies, call 100 (Police) or 108 (Ambulance).',
      timestamp: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState('');
  const [contacts, setContacts] = useState(SAMPLE_TRUSTED_CONTACTS);
  const [showAddContact, setShowAddContact] = useState(false);
  const [newContactName, setNewContactName] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [newContactRelation, setNewContactRelation] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = (text: string) => {
    if (!text.trim()) return;
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');

    setTimeout(() => {
      const responseMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: getResponse(text),
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, responseMsg]);
    }, 600);
  };

  const addContact = () => {
    if (!newContactName.trim() || !newContactPhone.trim()) return;
    setContacts(prev => [...prev, {
      id: `TC-${Date.now()}`,
      name: newContactName,
      relation: newContactRelation || 'Other',
      phone: newContactPhone,
    }]);
    setNewContactName('');
    setNewContactPhone('');
    setNewContactRelation('');
    setShowAddContact(false);
  };

  const removeContact = (id: string) => {
    setContacts(prev => prev.filter(c => c.id !== id));
  };

  return (
    <div className="max-w-5xl mx-auto">
      <PageHeader
        title="Safety Assistant"
        description="AI-powered emergency guidance for Chandigarh citizens. Multilingual-ready, grounded in safety protocols."
        icon={<Bot className="h-5 w-5 text-cyan-400" />}
        dataBanner="This is a DEMO assistant with limited knowledge. It does NOT provide medical, legal, or professional safety advice. For real emergencies, always call 100 (Police) or 108 (Ambulance)."
      />

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Chat */}
        <FadeIn className="lg:col-span-2">
          <div className="flex flex-col rounded-xl border border-navy-700 bg-navy-850" style={{ height: '600px' }}>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map(msg => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-xl px-4 py-2.5 text-sm ${
                    msg.role === 'user'
                      ? 'bg-cyan-500/15 border border-cyan-500/20 text-slate-600'
                      : 'bg-navy-800 border border-navy-700 text-slate-600'
                  }`}>
                    {msg.role === 'assistant' && (
                      <div className="mb-1 flex items-center gap-1.5">
                        <Bot className="h-3.5 w-3.5 text-cyan-400" />
                        <span className="text-[10px] font-medium text-cyan-400">Safety Assistant</span>
                      </div>
                    )}
                    <p className="whitespace-pre-line">{msg.content}</p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick prompts */}
            {messages.length <= 2 && (
              <div className="border-t border-navy-700 p-3">
                <p className="mb-2 text-[10px] font-semibold uppercase text-slate-600">Quick Prompts</p>
                <div className="flex flex-wrap gap-2">
                  {quickPrompts.map(p => (
                    <button
                      key={p}
                      onClick={() => sendMessage(p)}
                      className="rounded-lg border border-navy-600 bg-navy-800 px-3 py-1.5 text-xs text-slate-500 hover:border-cyan-500/30 hover:text-cyan-400"
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="border-t border-navy-700 p-3">
              <div className="flex gap-2">
                <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && sendMessage(input)}
                  placeholder="Ask about safety, reporting, or emergencies..."
                  className="flex-1 rounded-lg border border-navy-600 bg-navy-800 px-3 py-2.5 text-sm text-slate-600 placeholder-slate-600 focus:border-cyan-500/50 focus:outline-none"
                />
                <button
                  onClick={() => sendMessage(input)}
                  className="rounded-lg bg-cyan-500/20 border border-cyan-500/30 px-4 py-2.5 text-cyan-400 hover:bg-cyan-500/30"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </FadeIn>

        {/* Emergency + Trusted Contacts */}
        <FadeIn delay={0.05}>
          <div className="space-y-4">
            {/* Emergency numbers */}
            <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
              <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-red-400">
                <AlertTriangle className="h-4 w-4" /> Emergency Numbers
              </h2>
              <div className="space-y-2">
                {EMERGENCY_NUMBERS.map(num => (
                  <a
                    key={num.number}
                    href={`tel:${num.number}`}
                    className="flex items-center justify-between rounded-lg bg-navy-800 px-3 py-2 transition-all hover:bg-navy-700"
                  >
                    <div>
                      <p className="text-xs font-medium text-slate-600">{num.label}</p>
                      <p className="text-[10px] text-slate-500">{num.description}</p>
                    </div>
                    <span className="flex items-center gap-1.5 font-mono text-sm font-bold text-red-400">
                      <Phone className="h-3 w-3" /> {num.number}
                    </span>
                  </a>
                ))}
              </div>
            </div>

            {/* Trusted contacts */}
            <div className="rounded-xl border border-navy-700 bg-navy-850 p-4">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                  <Shield className="h-4 w-4 text-cyan-400" /> Trusted Contacts
                </h2>
                <button
                  onClick={() => setShowAddContact(!showAddContact)}
                  className="rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-2 py-1 text-xs text-cyan-400 hover:bg-cyan-500/20"
                >
                  <UserPlus className="h-3 w-3 inline mr-1" /> Add
                </button>
              </div>

              {showAddContact && (
                <div className="mb-3 space-y-2 rounded-lg border border-navy-600 bg-navy-800 p-3">
                  <input
                    value={newContactName}
                    onChange={e => setNewContactName(e.target.value)}
                    placeholder="Name"
                    className="w-full rounded border border-navy-600 bg-navy-900 px-2 py-1.5 text-sm text-slate-600 focus:outline-none"
                  />
                  <input
                    value={newContactRelation}
                    onChange={e => setNewContactRelation(e.target.value)}
                    placeholder="Relation (e.g. Family, Friend)"
                    className="w-full rounded border border-navy-600 bg-navy-900 px-2 py-1.5 text-sm text-slate-600 focus:outline-none"
                  />
                  <input
                    value={newContactPhone}
                    onChange={e => setNewContactPhone(e.target.value)}
                    placeholder="Phone number"
                    className="w-full rounded border border-navy-600 bg-navy-900 px-2 py-1.5 text-sm text-slate-600 focus:outline-none"
                  />
                  <button
                    onClick={addContact}
                    className="w-full rounded bg-cyan-500/20 py-1.5 text-xs font-medium text-cyan-400 hover:bg-cyan-500/30"
                  >
                    Save Contact
                  </button>
                </div>
              )}

              <div className="space-y-2">
                {contacts.map(c => (
                  <div key={c.id} className="flex items-center justify-between rounded-lg bg-navy-800 px-3 py-2">
                    <div>
                      <p className="text-sm text-slate-600">{c.name}</p>
                      <p className="text-[10px] text-slate-500">{c.relation} | {c.phone}</p>
                    </div>
                    <button onClick={() => removeContact(c.id)} className="text-slate-600 hover:text-red-400">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
                {contacts.length === 0 && (
                  <p className="text-center text-xs text-slate-500">No trusted contacts added yet</p>
                )}
              </div>
            </div>

            {/* Multilingual note */}
            <div className="rounded-xl border border-navy-700 bg-navy-850 p-4">
              <h2 className="mb-1 flex items-center gap-2 text-sm font-semibold text-slate-800">
                <Lightbulb className="h-4 w-4 text-cyan-400" /> Multilingual Support
              </h2>
              <p className="text-xs text-slate-500">
                The assistant is designed to support English, Hindi, and Punjabi. Multilingual responses will be available in a future update. The current demo operates in English only.
              </p>
            </div>
          </div>
        </FadeIn>
      </div>

      <div className="mt-4">
        <DataSourceBanner message="The Safety Assistant provides general safety guidance only. It does NOT offer medical, legal, or professional advice. Always contact emergency services (100/108) for real emergencies. Chat is not persisted in demo mode." />
      </div>
    </div>
  );
}
