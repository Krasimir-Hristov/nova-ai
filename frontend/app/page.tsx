'use client';

import { useState, useRef, useEffect } from 'react';

export default function Home() {
  const [messages, setMessages] = useState<
    Array<{ role: string; content: string; isStreaming?: boolean }>
  >([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState('Google');
  const [selectedModel, setSelectedModel] = useState('gemini-2.0-flash');
  const [availableModels, setAvailableModels] = useState<Record<string, any>>(
    {}
  );
  const messagesRef = useRef(messages);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  // Зареди налични модели при стартиране
  useEffect(() => {
    const fetchModels = async () => {
      try {
        const apiUrl =
          process.env.NEXT_PUBLIC_API_URL?.replace('/api/chat/stream', '') ||
          'http://localhost:8000';
        const response = await fetch(`${apiUrl}/api/models`);
        const data = await response.json();
        setAvailableModels(data.models || {});
        setSelectedCompany(data.current_company || 'Google');
        setSelectedModel(data.current_model || 'gemini-2.0-flash');
      } catch (error) {
        console.error('[FRONTEND LOG] Грешка при зареждане на модели:', error);
      }
    };
    fetchModels();
  }, []);

  const updateLastMessage = (content: string, isStreaming?: boolean) => {
    setMessages((prev) => {
      const updated = [...prev];
      if (updated[updated.length - 1]?.role === 'assistant') {
        updated[updated.length - 1].content = content;
        if (isStreaming !== undefined) {
          updated[updated.length - 1].isStreaming = isStreaming;
        }
      }
      return updated;
    });
  };

  const appendToLastMessage = (text: string) => {
    const current = [...messagesRef.current];
    if (current[current.length - 1]?.role === 'assistant') {
      current[current.length - 1].content += text;
      setMessages(current);
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    console.log('[FRONTEND LOG] Користувателско съобщение:', input);

    // Добави съобщението на потребителя
    const userMessage = { role: 'user', content: input };
    setMessages([...messages, userMessage]);
    const userInput = input;
    setInput('');
    setLoading(true);

    try {
      // Изпрати заявка към backend streaming endpoint
      const apiUrl = process.env.NEXT_PUBLIC_API_URL!;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userInput,
          company: selectedCompany,
          model: selectedModel,
        }),
      });

      if (!response.ok) throw new Error('Грешка при заявката');

      console.log('[FRONTEND LOG] Започва стрийма...');

      // Добави празното съобщение на бот-а с анимация
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: '', isStreaming: true },
      ]);

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) throw new Error('No reader available');

      let totalText = '';
      let chunkCount = 0;
      let buffer = ''; // Буфер за непълни редове
      let processedChunks = new Set(); // За избегаване на дублирани chunks

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');

        // Задържи последния непълен ред в буфера
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmedLine = line.trim();
          if (trimmedLine.startsWith('data: ')) {
            const jsonString = trimmedLine.slice(6).trim();

            if (!jsonString) continue;

            // Создаваме hash за този JSON chunk
            const chunkHash = `${jsonString}`;

            try {
              const json = JSON.parse(jsonString);

              if (json.done) {
                console.log(
                  '[FRONTEND LOG] Стрийма завършен. Всичко текст:',
                  totalText
                );
                // Премахни флага за streaming
                updateLastMessage(
                  messagesRef.current[messagesRef.current.length - 1]
                    ?.content || '',
                  false
                );
                processedChunks.clear();
                continue;
              }

              if (json.error) {
                console.error('[FRONTEND LOG] ГРЕШКА:', json.error);
                updateLastMessage(`❌ ГРЕШКА: ${json.error}`, false);
                setLoading(false);
                processedChunks.clear();
                break; // Спри стрийма при грешка
              }

              if (json.text) {
                // Проверяваме дали този точно chunk е обработен
                if (processedChunks.has(chunkHash)) {
                  console.log(
                    `[FRONTEND LOG] Дублиран chunk пропуснат: "${json.text.substring(
                      0,
                      50
                    )}..."`
                  );
                  continue;
                }

                processedChunks.add(chunkHash);
                chunkCount++;
                totalText += json.text;
                console.log(
                  `[FRONTEND LOG] Chunk #${chunkCount}: "${json.text}"`
                );

                // Добави текста директно без батчване
                appendToLastMessage(json.text);
              }
            } catch (e) {
              console.error(
                '[FRONTEND LOG] Грешка при парсване на JSON:',
                e,
                jsonString
              );
            }
          }
        }
      }

      // Обработи остатъка в буфера
      if (buffer.trim().startsWith('data: ')) {
        const jsonString = buffer.trim().slice(6).trim();
        if (jsonString) {
          try {
            const json = JSON.parse(jsonString);
            if (json.text) {
              totalText += json.text;
              console.log('[FRONTEND LOG] Последния chunk:', json.text);
              setMessages((prev) => {
                const updated = [...prev];
                if (updated[updated.length - 1]?.role === 'assistant') {
                  updated[updated.length - 1].content += json.text;
                }
                return updated;
              });
            }
          } catch (e) {
            console.error(
              '[FRONTEND LOG] Грешка при парсване на последния chunk:',
              e
            );
          }
        }
      }
    } catch (error) {
      console.error('[FRONTEND LOG] Грешка при свързване:', error);
      const errorMessage = {
        role: 'assistant',
        content: 'Грешка при свързване с сървъра.',
      };
      setMessages((prev) => [...prev, errorMessage]);
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
    <div className='flex min-h-screen flex-col items-center justify-center bg-linear-to-br from-black via-slate-900 to-slate-800 text-white p-2 sm:p-4'>
      {/* Субтилен фон */}
      <div className='absolute inset-0 overflow-hidden pointer-events-none opacity-30'>
        <div className='absolute top-1/4 left-1/4 w-96 h-96 bg-blue-900 rounded-full mix-blend-multiply filter blur-3xl opacity-10'></div>
        <div className='absolute bottom-1/4 right-1/4 w-96 h-96 bg-slate-700 rounded-full mix-blend-multiply filter blur-3xl opacity-10'></div>
      </div>

      <div className='relative z-10 w-full max-w-6xl flex flex-col h-screen max-h-screen sm:max-h-[750px] sm:rounded-xl sm:border sm:border-slate-600 sm:shadow-2xl sm:shadow-black/50 bg-linear-to-b from-black via-slate-900 to-black backdrop-blur-sm'>
        {/* Header */}
        <div className='bg-linear-to-r from-slate-950 to-slate-800 p-6 rounded-t-xl sm:rounded-t-xl border-b border-slate-700'>
          <div className='text-center'>
            <h1 className='text-3xl font-bold text-white'>NOVA</h1>
            <p className='text-sm text-slate-400 mt-2 font-medium'>
              AI Assistant
            </p>
            <p className='text-xs text-slate-500 mt-1'>Интелигентен диалог</p>
          </div>
        </div>

        {/* Messages Container */}
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
                  className={`max-w-2xl px-5 py-3 rounded-lg transition-all ${
                    msg.role === 'user'
                      ? 'bg-slate-700 text-white rounded-br-none border border-slate-600 shadow-md shadow-black/30'
                      : 'bg-slate-800 text-slate-100 rounded-bl-none border border-slate-700 shadow-md shadow-black/30'
                  } ${
                    msg.isStreaming
                      ? 'bg-linear-to-r from-slate-800 via-slate-750 to-slate-800 animate-pulse'
                      : ''
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
        <div className='border-t border-slate-700 p-6 bg-linear-to-r from-black via-slate-950 to-black rounded-b-xl sm:rounded-b-xl'>
          <div className='flex gap-3 mb-3'>
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

          {/* Company Selector */}
          <div className='flex gap-3'>
            <select
              value={selectedCompany}
              onChange={(e) => {
                setSelectedCompany(e.target.value);
                // Автоматично избери първия модел от новата компания
                const modelsForCompany = availableModels[e.target.value];
                if (modelsForCompany) {
                  const firstModelId = Object.keys(modelsForCompany)[0];
                  setSelectedModel(firstModelId);
                }
              }}
              className='flex-1 px-3 py-2 bg-slate-800 text-white text-sm rounded border border-slate-600 hover:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-600 transition'
            >
              {Object.keys(availableModels).map((company) => (
                <option key={company} value={company}>
                  {company}
                </option>
              ))}
            </select>

            {/* Model Selector */}
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className='flex-1 px-3 py-2 bg-slate-800 text-white text-sm rounded border border-slate-600 hover:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-600 transition'
            >
              {selectedCompany &&
                availableModels[selectedCompany] &&
                Object.entries(availableModels[selectedCompany]).map(
                  ([modelId, modelInfo]: [string, any]) => (
                    <option key={modelId} value={modelId}>
                      {modelInfo.name} - {modelInfo.description}
                    </option>
                  )
                )}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
