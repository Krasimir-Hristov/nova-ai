'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { ChatMessages } from '@/components/ChatMessages';
import { ChatInput } from '@/components/ChatInput';
import { ModelSelector } from '@/components/ModelSelector';
import { FontSizeSelector } from '@/components/FontSizeSelector';
import { useChatMessages } from '@/hooks/useChatMessages';
import { useModels } from '@/hooks/useModels';
import { useStreamingChat } from '@/hooks/useStreamingChat';

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg' | 'xl'>('base');

  // Chat messages logic
  const {
    messages,
    messagesRef,
    syncMessagesRef,
    addMessage,
    addAssistantMessage,
    appendToLastMessage,
    updateLastMessage,
  } = useChatMessages();

  // Models logic
  const {
    selectedCompany,
    setSelectedCompany,
    selectedModel,
    setSelectedModel,
    availableModels,
    getCompanies,
    getModelsForCompany,
  } = useModels();

  // Streaming chat logic
  const { sendMessage, stopStream } = useStreamingChat({
    selectedCompany,
    selectedModel,
    messagesRef,
    appendToLastMessage,
    updateLastMessage,
    addAssistantMessage,
    onStreamComplete: () => {
      setLoading(false);
      syncMessagesRef();
    },
    onError: () => {
      setLoading(false);
    },
    onAbort: () => {
      setLoading(false);
      syncMessagesRef();
    },
  });

  // Синхронизирай ref със state при промяна на messages
  useEffect(() => {
    syncMessagesRef();
  }, [messages, syncMessagesRef]);

  const [input, setInput] = useState('');

  const handleSendMessage = async () => {
    if (!input.trim() || loading) return;

    const userInput = input;
    setInput('');
    setLoading(true);

    console.log('[FRONTEND LOG] Потребител:', userInput);
    addMessage('user', userInput);

    await sendMessage(userInput);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className='h-screen bg-linear-to-br from-black via-slate-950 to-black flex flex-col'>
      {/* Main Chat Area */}
      <div className='flex-1 flex flex-col overflow-hidden'>
        {/* Messages */}
        <ChatMessages messages={messages} fontSize={fontSize} />

        {/* Input Area with Controls */}
        <div className='border-t border-slate-700 bg-linear-to-r from-black via-slate-950 to-black p-6'>
          <div className='max-w-3xl mx-auto space-y-4'>
            {/* Chat Input */}
            <ChatInput
              input={input}
              loading={loading}
              onInputChange={setInput}
              onSendMessage={handleSendMessage}
              onKeyPress={handleKeyPress}
              onStopStream={stopStream}
            />
            
            {/* Controls Row - Font Size & Model Selector */}
            <div className='flex items-center justify-between gap-4 px-2'>
              {/* Font Size Selector */}
              <div className='shrink-0'>
                <FontSizeSelector
                  fontSize={fontSize}
                  onFontSizeChange={setFontSize}
                />
              </div>

              {/* Model Selector */}
              <div className='shrink-0'>
                <ModelSelector
                  selectedCompany={selectedCompany}
                  selectedModel={selectedModel}
                  companies={getCompanies()}
                  modelsForCompany={getModelsForCompany(selectedCompany)}
                  onCompanyChange={setSelectedCompany}
                  onModelChange={setSelectedModel}
                  compact={true}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
