import { useCallback, useRef } from 'react';

interface UseStreamingChatProps {
  selectedCompany: string;
  selectedModel: string;
  messagesRef: React.MutableRefObject<any[]>;
  appendToLastMessage: (text: string) => void;
  updateLastMessage: (content: string, isStreaming?: boolean) => void;
  addAssistantMessage: (isStreaming?: boolean) => void;
  onStreamComplete?: () => void;
  onError?: (error: string) => void;
  onAbort?: () => void;
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
  onAbort,
}: UseStreamingChatProps) => {
  const abortControllerRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(
    async (userInput: string) => {
      try {
        // Отмяни предишния стрийм ако съществува
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }

        // Създай нов AbortController за текущия стрийм
        abortControllerRef.current = new AbortController();
        const signal = abortControllerRef.current.signal;

        const apiUrl = process.env.NEXT_PUBLIC_API_URL!;
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: userInput,
            company: selectedCompany,
            model: selectedModel,
          }),
          signal,
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
        let chunkCounter = 0;

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

              try {
                const json = JSON.parse(jsonString);

                if (json.done) {
                  console.log(
                    '[FRONTEND LOG] Стрийма завършен. Всичко текст:',
                    totalText
                  );

                  // Check if stream was cancelled by backend
                  if (json.cancelled) {
                    console.log('[FRONTEND LOG] Backend потвърди отмяна');
                    updateLastMessage('⏸ Прервано', false);
                  } else {
                    updateLastMessage(
                      messagesRef.current[messagesRef.current.length - 1]
                        ?.content || '',
                      false
                    );
                  }
                  onStreamComplete?.();
                  return;
                }

                if (json.error) {
                  console.error('[FRONTEND LOG] ГРЕШКА:', json.error);
                  updateLastMessage(`❌ ГРЕШКА: ${json.error}`, false);
                  onError?.(json.error);
                  return;
                }

                if (json.text) {
                  chunkCounter++;
                  totalText += json.text;
                  appendToLastMessage(json.text);
                  console.log(
                    `[FRONTEND LOG] Chunk #${chunkCounter}:`,
                    json.text
                  );
                }
              } catch (e) {
                console.error('[FRONTEND LOG] Грешка при парсване на JSON:', e);
              }
            }
          }
        }
      } catch (error) {
        // Не се беспокой за отмяна грешка
        if (error instanceof Error && error.name === 'AbortError') {
          console.log('[FRONTEND LOG] Стрийма отменен');
          // Replace last message with abort message
          updateLastMessage('Message cancelled.......', false);
          onAbort?.();
          return;
        }
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
      onAbort,
    ]
  );

  const stopStream = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      console.log('[FRONTEND LOG] Стопиране на стрийм от потребител');

      // Tell backend to cancel stream
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL!.replace(
        '/chat/stream',
        ''
      );
      fetch(`${apiBaseUrl}/cancel-stream`, {
        method: 'POST',
      }).catch((err) =>
        console.error('[FRONTEND LOG] Грешка при cancel:', err)
      );
    }
  }, []);

  return { sendMessage, stopStream };
};
