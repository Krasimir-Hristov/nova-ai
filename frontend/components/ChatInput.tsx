import React from 'react';

interface ChatInputProps {
  input: string;
  loading: boolean;
  onInputChange: (value: string) => void;
  onSendMessage: () => void;
  onStopStream?: () => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  input,
  loading,
  onInputChange,
  onSendMessage,
  onKeyPress,
  onStopStream,
}) => {
  return (
    <div className='flex gap-3 mb-3'>
      <input
        type='text'
        value={input}
        onChange={(e) => onInputChange(e.target.value)}
        onKeyPress={onKeyPress}
        placeholder='Talk with NOVA...'
        className='flex-1 p-4 rounded-lg bg-slate-800 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-600 focus:ring-offset-2 focus:ring-offset-black transition-all border border-slate-700 focus:border-slate-500'
      />
      <button
        onClick={loading && onStopStream ? onStopStream : onSendMessage}
        disabled={!loading && !input.trim()}
        className={`font-bold px-8 py-4 rounded-lg transition-all transform hover:scale-105 active:scale-95 cursor-pointer border shadow-md shadow-black/50 ${
          loading
            ? 'bg-red-600 hover:bg-red-500 border-red-500 hover:border-red-400 text-white'
            : 'bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:opacity-50 text-white border-slate-600 hover:border-slate-500'
        }`}
      >
        {loading ? '⏹ Stop' : '→'}
      </button>
    </div>
  );
};
