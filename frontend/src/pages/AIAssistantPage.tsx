import React, { useState, useEffect, useRef } from 'react';
import { useEventContext } from '../context/EventContext';
import { api } from '../services/api';
import { ChatMessage } from '../types';
import { 
  Bot, 
  Send, 
  Sparkles, 
  User, 
  HelpCircle, 
  RefreshCw, 
  CheckCircle2,
  Calendar,
  Layers,
  ArrowRight,
  Trash2,
  Copy,
  Check
} from 'lucide-react';

export const AIAssistantPage: React.FC = () => {
  const { currentEvent, updateCurrentEvent, addToast } = useEventContext();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const initialAssistantMessage: ChatMessage = {
    id: 'm-0',
    role: 'assistant',
    content: `Hello! I'm your dedicated CelebrAI Copilot for **${currentEvent?.title || 'your celebration'}**.\n\nI have complete contextual access to your **₹${Number(currentEvent?.total_budget || 15000).toLocaleString()} budget**, **${currentEvent?.guest_count || 30} guests**, and active **${currentEvent?.theme.vibe_keywords.join(', ') || 'pastel'} theme**.\n\nAsk me anything or instruct me to adjust your live plan!`,
    timestamp: 'Just now',
    suggested_actions: [
      'How can I reduce my event expenses?',
      'Suggest decorations under ₹2,000.',
      'Change my theme to lavender and white.',
      'Generate a vegetarian menu.'
    ]
  };

  const [messages, setMessages] = useState<ChatMessage[]>([initialAssistantMessage]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.chatWithAI(currentEvent, messages, query);

      // If AI applied a live patch to current event, update global state!
      if (res.updated_event_patch) {
        await updateCurrentEvent(res.updated_event_patch);
        addToast('success', 'Event Modified via AI', 'Live updates applied to your event.');
      }

      const botMsg: ChatMessage = {
        id: `a-${Date.now()}`,
        role: 'assistant',
        content: res.response,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggested_actions: res.suggested_actions
      };

      setMessages(prev => [...prev, botMsg]);
    } catch (err: any) {
      addToast('error', 'Chat error', 'Failed to communicate with AI');
    } finally {
      setLoading(false);
    }
  };

  const handleActionClick = (action: string) => {
    handleSend(action);
  };

  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    addToast('info', 'Copied to Clipboard');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearChat = () => {
    setMessages([initialAssistantMessage]);
    addToast('info', 'Chat Cleared', 'Conversation history reset.');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4 pb-16 flex flex-col h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-brand-lavender/60 dark:border-white/10 pb-3">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs uppercase font-semibold tracking-wider text-brand-purple dark:text-brand-lavender">
              Context-Aware Companion
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              Live Event Synced
            </span>
          </div>
          <h1 className="font-serif text-2xl font-bold text-brand-navy dark:text-brand-warm-white mt-1">
            CelebrAI Event Assistant
          </h1>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleClearChat}
            className="p-2 rounded-xl text-gray-400 hover:text-rose-500 hover:bg-gray-100 dark:hover:bg-white/5 transition-all text-xs flex items-center space-x-1"
            title="Reset Chat"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Clear</span>
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-2">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start space-x-3 ${
              msg.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-purple to-brand-lavender flex items-center justify-center text-white flex-shrink-0 shadow-xs mt-1">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div
              className={`max-w-xl p-4 rounded-2xl text-xs leading-relaxed relative group ${
                msg.role === 'user'
                  ? 'bg-brand-purple text-white shadow-xs rounded-tr-none'
                  : 'bg-white dark:bg-[#1B1E2E] border border-brand-lavender/70 dark:border-white/10 shadow-xs rounded-tl-none text-brand-navy dark:text-brand-warm-white'
              }`}
            >
              <div className="whitespace-pre-line">{msg.content}</div>

              {/* Timestamp & Copy button */}
              <div className={`flex items-center justify-between text-[10px] mt-2 pt-1 border-t ${
                msg.role === 'user' ? 'border-white/20 text-white/70' : 'border-gray-100 dark:border-white/5 text-gray-400'
              }`}>
                <span>{msg.timestamp}</span>
                <button
                  onClick={() => handleCopyMessage(msg.id, msg.content)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity ml-2 hover:underline flex items-center space-x-1"
                >
                  {copiedId === msg.id ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedId === msg.id ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              {/* Suggested actions chips */}
              {msg.suggested_actions && msg.suggested_actions.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-100 dark:border-white/10 space-y-1.5">
                  <span className="text-[10px] font-semibold text-gray-400 block">Suggested Quick Actions:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {msg.suggested_actions.map((act, i) => (
                      <button
                        key={i}
                        onClick={() => handleActionClick(act)}
                        className="text-[11px] px-2.5 py-1 rounded-lg bg-brand-lavender/50 hover:bg-brand-lavender text-brand-purple dark:bg-white/5 dark:hover:bg-white/10 dark:text-brand-lavender font-medium transition-all text-left flex items-center space-x-1 border border-brand-lavender/40 dark:border-white/5"
                      >
                        <span>{act}</span>
                        <ArrowRight className="w-3 h-3 opacity-60" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-xl bg-brand-navy dark:bg-white/10 flex items-center justify-center text-white flex-shrink-0 shadow-xs mt-1">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex items-center space-x-2 text-xs text-brand-purple animate-pulse pl-11">
            <Sparkles className="w-4 h-4 animate-spin" />
            <span>CelebrAI is reasoning and checking your event details...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <div className="p-3 rounded-2xl bg-white dark:bg-[#1B1E2E] border border-brand-lavender dark:border-white/10 shadow-premium">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center space-x-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything or command changes (e.g. 'Change my theme to lavender and white' or 'Reduce decor by ₹1,000')..."
            className="flex-1 bg-transparent text-xs text-brand-navy dark:text-brand-warm-white focus:outline-none px-2"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="p-2.5 rounded-xl bg-brand-purple hover:bg-brand-purple-dark text-white disabled:opacity-40 transition-all shadow-xs"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
