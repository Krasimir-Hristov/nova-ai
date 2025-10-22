'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { ChatMessages } from '@/components/ChatMessages';
import { ChatInput } from '@/components/ChatInput';
import { ModelSelector } from '@/components/ModelSelector';
import { useChatMessages } from '@/hooks/useChatMessages';
import { useModels } from '@/hooks/useModels';
import { useStreamingChat } from '@/hooks/useStreamingChat';

export default function Home() {
  const [loading, setLoading] = useState(false);

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
  const { sendMessage } = useStreamingChat({
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
    <div className='min-h-screen bg-linear-to-br from-black via-slate-950 to-black flex items-center justify-center p-4'>
      <div className='w-full max-w-2xl h-screen md:h-[600px] bg-slate-900 rounded-xl flex flex-col shadow-2xl shadow-black/50 border border-slate-800'>
        {/* Header */}
        <Header />

        {/* Messages */}
        <ChatMessages messages={messages} />

        {/* Input Area */}
        <div className='border-t border-slate-700 p-6 bg-linear-to-r from-black via-slate-950 to-black rounded-b-xl sm:rounded-b-xl'>
          <ChatInput
            input={input}
            loading={loading}
            onInputChange={setInput}
            onSendMessage={handleSendMessage}
            onKeyPress={handleKeyPress}
          />

          {/* Model Selector */}
          <ModelSelector
            selectedCompany={selectedCompany}
            selectedModel={selectedModel}
            companies={getCompanies()}
            modelsForCompany={getModelsForCompany(selectedCompany)}
            onCompanyChange={setSelectedCompany}
            onModelChange={setSelectedModel}
          />
        </div>
      </div>
    </div>
  );
}
