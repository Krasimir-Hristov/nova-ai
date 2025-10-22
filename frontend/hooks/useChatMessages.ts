import { useState, useRef, useCallback } from 'react';

export interface Message {
  role: string;
  content: string;
  isStreaming?: boolean;
}

export const useChatMessages = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesRef = useRef(messages);

  // Синхронизирай ref със state
  const syncMessagesRef = useCallback(() => {
    messagesRef.current = messages;
  }, [messages]);

  const updateLastMessage = useCallback(
    (content: string, isStreaming?: boolean) => {
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
    },
    []
  );

  const appendToLastMessage = useCallback((text: string) => {
    const current = [...messagesRef.current];
    if (current[current.length - 1]?.role === 'assistant') {
      current[current.length - 1].content += text;
      messagesRef.current = current;
      setMessages(current);
    }
  }, []);

  const addMessage = useCallback((role: string, content: string) => {
    setMessages((prev) => [...prev, { role, content }]);
  }, []);

  const addAssistantMessage = useCallback((isStreaming = true) => {
    setMessages((prev) => [
      ...prev,
      { role: 'assistant', content: '', isStreaming },
    ]);
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
    messagesRef.current = [];
  }, []);

  return {
    messages,
    messagesRef,
    syncMessagesRef,
    updateLastMessage,
    appendToLastMessage,
    addMessage,
    addAssistantMessage,
    clearMessages,
  };
};
