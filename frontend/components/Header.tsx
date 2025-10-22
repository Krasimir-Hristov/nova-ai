import React from 'react';

export const Header: React.FC = () => {
  return (
    <div className='border-b border-slate-700 p-6 bg-linear-to-r from-black via-slate-950 to-black rounded-t-xl sm:rounded-t-xl'>
      <div className='text-center'>
        <h1 className='text-3xl font-bold text-white'>NOVA</h1>
        <p className='text-sm text-slate-400 mt-2 font-medium'>
          AI Assistant
        </p>
        <p className='text-xs text-slate-500 mt-1'>Интелигентен диалог</p>
      </div>
    </div>
  );
};
