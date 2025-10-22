import React from 'react';

export const Header: React.FC = () => {
  return (
    <div className='border-b border-slate-700/50 bg-linear-to-r from-black via-slate-950 to-black'>
      <div className='max-w-7xl mx-auto px-6 py-4 flex items-center justify-between'>
        {/* Left - Logo/Brand */}
        <div className='flex items-center gap-4'>
          <h1 className='text-4xl font-black bg-linear-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent tracking-[0.3em]'>
            NOVA
          </h1>
          <span className='text-[20px] text-slate-600 font-medium px-2 py-0.5 rounded bg-slate-800/30 border border-slate-700/50'>
            AI Assistant
          </span>
        </div>

        {/* Right - Info/Settings */}
        <div className='flex items-center gap-4'>
          <div className='text-2xl text-slate-500 hidden sm:block'>
            Krasimir
          </div>
          {/* Settings icon placeholder */}
          <button className='w-8 h-8 rounded-lg cursor-pointer  hover:bg-slate-800/50 flex items-center justify-center transition-colors group'>
            <svg
              className='w-6 h-6 text-slate-400 group-hover:text-slate-300 transition-colors cursor-pointer'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z'
              />
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M15 12a3 3 0 11-6 0 3 3 0 016 0z'
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};
