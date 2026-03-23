import { useState, useRef, useEffect } from 'react';
import { Send, Cpu, Sparkles } from 'lucide-react';
import { getAIResponse } from '@/lib/syncplant-data';

interface Message {
  role: 'user' | 'ai';
  content: string;
}

const QUICK_PROMPTS = [
  'Which machine is most risky?',
  'Tell me about TR-01',
  '7-day forecast',
  'Cost savings report',
];

interface Props {
  fullPage?: boolean;
}

export default function AIChat({ fullPage = false }: Props) {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', content: 'SyncPlant AI online. All systems connected. TR-01 flagged for immediate attention � core temperature critical. How can I assist?' }
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setTyping(true);

    setTimeout(() => {
      const response = getAIResponse(text);
      setMessages(prev => [...prev, { role: 'ai', content: response }]);
      setTyping(false);
    }, 600 + Math.random() * 800);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    send(input);
  };

  return (
    <div className={`flex flex-col bg-card border border-border rounded-lg overflow-hidden ${fullPage ? 'h-[calc(100vh-12rem)]' : 'h-[600px]'}`}>
      {/* Header */}
      <div className="p-3 border-b border-border bg-secondary/30 flex items-center gap-2 shrink-0">
        <Cpu size={16} className="text-ai" />
        <span className="text-xs font-bold uppercase tracking-widest text-foreground">SyncPlant AI</span>
        <div className="ml-auto flex items-center gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-safe live-pulse" />
          <span className="text-[10px] text-muted-foreground font-mono">ONLINE</span>
        </div>
      </div>

      {/* Quick Prompts */}
      <div className="p-2 border-b border-border flex gap-2 overflow-x-auto shrink-0">
        {QUICK_PROMPTS.map((p) => (
          <button
            key={p}
            onClick={() => send(p)}
            className="btn-secondary text-[10px] whitespace-nowrap py-1 px-2 flex items-center gap-1"
          >
            <Sparkles size={10} /> {p}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-3 rounded-lg text-xs leading-relaxed whitespace-pre-wrap ${
              msg.role === 'user'
                ? 'bg-ai text-primary-foreground'
                : 'bg-secondary text-foreground border border-border'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        {typing && (
          <div className="flex justify-start">
            <div className="bg-secondary text-foreground border border-border p-3 rounded-lg text-xs">
              <span className="inline-flex gap-1">
                <span className="w-1.5 h-1.5 bg-ai rounded-full live-pulse" />
                <span className="w-1.5 h-1.5 bg-ai rounded-full live-pulse" style={{ animationDelay: '0.2s' }} />
                <span className="w-1.5 h-1.5 bg-ai rounded-full live-pulse" style={{ animationDelay: '0.4s' }} />
              </span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-3 border-t border-border bg-secondary/20 shrink-0">
        <div className="relative">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about machine health, risks, costs..."
            className="w-full bg-card border border-border rounded-md py-2.5 pl-3 pr-10 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-ai transition-colors"
          />
          <button type="submit" className="absolute right-2 top-2 text-muted-foreground hover:text-ai transition-colors">
            <Send size={16} />
          </button>
        </div>
      </form>
    </div>
  );
}
