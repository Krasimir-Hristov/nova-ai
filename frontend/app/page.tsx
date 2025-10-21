'use client';

import { useState } from 'react';

export default function Home() {
  const [messages, setMessages] = useState<
    Array<{ role: string; content: string }>
  >([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    // Добави съобщението на потребителя
    const userMessage = { role: 'user', content: input };
    setMessages([...messages, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // Изпрати заявка към backend
      const response = await fetch('http://localhost:8000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input }),
      });

      const data = await response.json();
      const botMessage = {
        role: 'assistant',
        content: data.response || 'Извиняванията ми, възникна грешка.',
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      const errorMessage = {
        role: 'assistant',
        content: 'Грешка при свързване с сървъра.',
      };
      setMessages((prev) => [...prev, errorMessage]);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className='flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-black via-slate-900 to-slate-800 text-white p-2 sm:p-4'>
      {/* Субтилен фон */}
      <div className='absolute inset-0 overflow-hidden pointer-events-none opacity-30'>
        <div className='absolute top-1/4 left-1/4 w-96 h-96 bg-blue-900 rounded-full mix-blend-multiply filter blur-3xl opacity-10'></div>
        <div className='absolute bottom-1/4 right-1/4 w-96 h-96 bg-slate-700 rounded-full mix-blend-multiply filter blur-3xl opacity-10'></div>
      </div>

      <div className='relative z-10 w-full max-w-6xl flex flex-col h-screen max-h-screen sm:max-h-[750px] sm:rounded-xl sm:border sm:border-slate-600 sm:shadow-2xl sm:shadow-black/50 bg-gradient-to-b from-black via-slate-900 to-black backdrop-blur-sm'>
        {/* Header */}
        <div className='bg-gradient-to-r from-slate-950 to-slate-800 p-6 rounded-t-xl sm:rounded-t-xl border-b border-slate-700'>
          <div className='text-center'>
            <h1 className='text-3xl font-bold text-white'>
              NOVA
            </h1>
            <p className='text-sm text-slate-400 mt-2 font-medium'>AI Assistant</p>
            <p className='text-xs text-slate-500 mt-1'>Интелигентен диалог</p>
          </div>
        </div>

        {/* Messages Container */}
        <div className='flex-1 overflow-y-auto p-6 space-y-4'>
          {messages.length === 0 ? (
            <div className='flex items-center justify-center h-full'>
              <div className='text-center'>
                <p className='text-lg text-slate-300'>
                  Добре дошъл в NOVA
                </p>
                <p className='text-sm text-slate-500 mt-2'>Начни разговор...</p>
              </div>
            </div>
          ) : (
            messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-2xl px-5 py-3 rounded-lg transition-all ${
                    msg.role === 'user'
                      ? 'bg-slate-700 text-white rounded-br-none border border-slate-600 shadow-md shadow-black/30'
                      : 'bg-slate-800 text-slate-100 rounded-bl-none border border-slate-700 shadow-md shadow-black/30'
                  }`}
                >
                  <p className='text-sm leading-relaxed'>{msg.content}</p>
                </div>
              </div>
            ))
          )}
          {loading && (
            <div className='flex justify-start'>
              <div className='bg-slate-800 px-5 py-3 rounded-lg rounded-bl-none border border-slate-700 shadow-md shadow-black/30'>
                <p className='text-sm text-slate-400 flex items-center gap-2'>
                  <span className='animate-pulse'>●</span>
                  <span>NOVA пишe...</span>
                  <span className='animate-pulse'>●</span>
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className='border-t border-slate-700 p-6 bg-gradient-to-r from-black via-slate-950 to-black rounded-b-xl sm:rounded-b-xl'>
          <div className='flex gap-3'>
            <input
              type='text'
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder='Питай NOVA...'
              disabled={loading}
              className='flex-1 p-4 rounded-lg bg-slate-800 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-600 focus:ring-offset-2 focus:ring-offset-black disabled:opacity-50 transition-all border border-slate-700 focus:border-slate-500'
            />
            <button
              onClick={handleSendMessage}
              disabled={loading || !input.trim()}
              className='bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:opacity-50 text-white font-bold px-8 py-4 rounded-lg transition-all transform hover:scale-105 active:scale-95 cursor-pointer border border-slate-600 hover:border-slate-500 shadow-md shadow-black/50'
            >
                            {loading ? '...' : '→'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
