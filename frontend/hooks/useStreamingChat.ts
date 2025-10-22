import { useCallback } from 'react';

interface UseStreamingChatProps {
  selectedCompany: string;
  selectedModel: string;
  messagesRef: React.MutableRefObject<any[]>;
  appendToLastMessage: (text: string) => void;
  updateLastMessage: (content: string, isStreaming?: boolean) => void;
  addAssistantMessage: (isStreaming?: boolean) => void;
  onStreamComplete?: () => void;
  onError?: (error: string) => void;
}

export const useStreamingChat = ({
  selectedCompany,
  selectedModel,
  messagesRef,
  appendToLastMessage,
  updateLastMessage,
  addAssistantMessage,
  onStreamComplete,
  onError,
}: UseStreamingChatProps) => {
  const sendMessage = useCallback(
    async (userInput: string) => {
      try {
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
        addAssistantMessage(true);

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        if (!reader) throw new Error('No reader available');

        let totalText = '';
        let buffer = '';
        let processedChunks = new Set();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');

          buffer = lines.pop() || '';

          for (const line of lines) {
            const trimmedLine = line.trim();
            if (trimmedLine.startsWith('data: ')) {
              const jsonString = trimmedLine.slice(6).trim();

              if (!jsonString) continue;

              const chunkHash = `${jsonString}`;

              try {
                const json = JSON.parse(jsonString);

                if (json.done) {
                  console.log(
                    '[FRONTEND LOG] Стрийма завършен. Всичко текст:',
                    totalText
                  );
                  updateLastMessage(
                    messagesRef.current[messagesRef.current.length - 1]
                      ?.content || '',
                    false
                  );
                  processedChunks.clear();
                  onStreamComplete?.();
                  return;
                }

                if (json.error) {
                  console.error('[FRONTEND LOG] ГРЕШКА:', json.error);
                  updateLastMessage(`❌ ГРЕШКА: ${json.error}`, false);
                  processedChunks.clear();
                  onError?.(json.error);
                  return;
                }

                if (json.text) {
                  if (!processedChunks.has(chunkHash)) {
                    processedChunks.add(chunkHash);
                    totalText += json.text;
                    appendToLastMessage(json.text);
                    console.log('[FRONTEND LOG] Chunk добавен:', json.text);
                  }
                }
              } catch (e) {
                console.error('[FRONTEND LOG] Грешка при парсване на JSON:', e);
              }
            }
          }
        }
      } catch (error) {
        console.error('[FRONTEND LOG] Грешка при свързване:', error);
        const errorMessage = {
          role: 'assistant',
          content: `❌ Грешка при свързване: ${error}`,
        };
        onError?.(String(error));
      }
    },
    [
      selectedCompany,
      selectedModel,
      messagesRef,
      appendToLastMessage,
      updateLastMessage,
      addAssistantMessage,
      onStreamComplete,
      onError,
    ]
  );

  return { sendMessage };
};
