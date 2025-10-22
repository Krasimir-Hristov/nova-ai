import React, { useEffect, useRef } from 'react';
import { Message } from '@/hooks/useChatMessages';

interface ChatMessagesProps {
  messages: Message[];
  fontSize?: 'sm' | 'base' | 'lg' | 'xl';
}

const FONT_SIZE_MAP = {
  sm: 'text-sm',
  base: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl',
};

export const ChatMessages: React.FC<ChatMessagesProps> = ({
  messages,
  fontSize = 'base',
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Автоматично скролиране надолу когато има нови съобщения
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className='flex-1 overflow-y-auto relative'>
      {/* NOVA Watermark - Always visible as background */}
      <div className='fixed inset-0 flex items-center justify-center pointer-events-none z-0'>
        <h2
          className={`font-black bg-linear-to-r from-blue-400 to-blue-700 bg-clip-text text-transparent tracking-[0.4em] leading-[0.9] text-[13vw] whitespace-nowrap text-center transition-opacity duration-500 ${
            messages.length === 0 ? 'opacity-100' : 'opacity-10'
          }`}
        >
          NOVA
        </h2>
      </div>

      {/* Messages - positioned above watermark */}
      {messages.length > 0 && (
        <div className='p-6 space-y-4 relative z-10'>
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${
                msg.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-2xl px-5 py-3 rounded-lg border shadow-md shadow-black/30 ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white rounded-br-none border-blue-500'
                    : `bg-slate-800 text-slate-100 rounded-bl-none border-slate-700 ${
                        msg.isStreaming ? 'animate-pulse' : ''
                      }`
                }`}
              >
                <p className={`${FONT_SIZE_MAP[fontSize]} leading-relaxed`}>
                  {msg.content}
                </p>
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
          ))}
          {/* Невидим div за скролиране */}
          <div ref={messagesEndRef} />
        </div>
      )}
    </div>
  );
};
