
import React, { useState } from 'react';
import { getCreativeAdvice } from '../services/gemini';

const AIAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [chat, setChat] = useState<{ role: 'user' | 'ai', text: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMsg = input;
    setInput('');
    setChat(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    const aiResponse = await getCreativeAdvice(userMsg);
    setChat(prev => [...prev, { role: 'ai', text: aiResponse || '' }]);
    setIsLoading(false);
  };

  return (
    <div className="fixed bottom-10 right-10 z-[100]">
      {/* Bubble Toggle */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-16 h-16 bg-black text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform"
      >
        {isOpen ? (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="absolute bottom-20 right-0 w-80 md:w-96 bg-white border border-black shadow-2xl flex flex-col max-h-[500px]">
          <div className="p-4 bg-black text-white font-bold text-xs uppercase tracking-widest">
            AI Creative Consultant
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[200px]">
            {chat.length === 0 && (
              <p className="text-gray-400 text-sm italic">Ask me how we can elevate your next production.</p>
            )}
            {chat.map((msg, idx) => (
              <div key={idx} className={`${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                <span className={`inline-block p-3 text-xs leading-relaxed ${
                  msg.role === 'user' ? 'bg-gray-100 text-black' : 'bg-black text-white'
                }`}>
                  {msg.text}
                </span>
              </div>
            ))}
            {isLoading && (
              <div className="text-left">
                <span className="inline-block p-3 bg-gray-200 animate-pulse text-[10px] font-bold uppercase tracking-widest">Thinking...</span>
              </div>
            )}
          </div>

          <div className="p-4 border-t border-black flex">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Tell me about your project..."
              className="flex-1 text-xs outline-none uppercase font-bold tracking-tight"
            />
            <button 
              onClick={handleSend}
              className="ml-2 font-black text-xs uppercase"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIAssistant;
