import React, { useEffect, useRef } from 'react';
import { Message } from '@/hooks/useChatMessages';

interface ChatMessagesProps {
  messages: Message[];
}

export const ChatMessages: React.FC<ChatMessagesProps> = ({ messages }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Автоматично скролиране надолу когато има нови съобщения
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className='flex-1 overflow-y-auto p-6 space-y-4'>
      {messages.length === 0 ? (
        <div className='flex items-center justify-center h-full'>
          <div className='text-center'>
            <p className='text-lg text-slate-300'>Добре дошъл в NOVA</p>
            <p className='text-sm text-slate-500 mt-2'>Начни разговор...</p>
          </div>
        </div>
      ) : (
        messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${
              msg.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-5 py-3 rounded-lg border shadow-md shadow-black/30 ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white rounded-br-none border-blue-500'
                  : `bg-slate-800 text-slate-100 rounded-bl-none border-slate-700 ${
                      msg.isStreaming ? 'animate-pulse' : ''
                    }`
              }`}
            >
              <p className='text-lg leading-relaxed'>{msg.content}</p>
              {msg.isStreaming && (
                <div className='flex items-center gap-1 mt-2'>
                  <span className='inline-block w-1 h-1 bg-blue-400 rounded-full animate-bounce'></span>
                  <span
                    className='inline-block w-1 h-1 bg-blue-400 rounded-full animate-bounce'
                    style={{ animationDelay: '0.1s' }}
                  ></span>
                  <span
                    className='inline-block w-1 h-1 bg-blue-400 rounded-full animate-bounce'
                    style={{ animationDelay: '0.2s' }}
                  ></span>
                </div>
              )}
            </div>
          </div>
        ))
      )}
      {/* Невидим div за скролиране */}
      <div ref={messagesEndRef} />
    </div>
  );
};
