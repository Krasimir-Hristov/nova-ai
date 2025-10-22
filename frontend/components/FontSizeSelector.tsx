import React from 'react';

interface FontSizeSelectorProps {
  fontSize: 'sm' | 'base' | 'lg' | 'xl';
  onFontSizeChange: (size: 'sm' | 'base' | 'lg' | 'xl') => void;
}

const FONT_SIZES = [
  { value: 'sm', label: 'Small (12px)', description: 'А' },
  { value: 'base', label: 'Regular (16px)', description: 'А' },
  { value: 'lg', label: 'Large (18px)', description: 'А' },
  { value: 'xl', label: 'Extra Large (20px)', description: 'А' },
];

export const FontSizeSelector: React.FC<FontSizeSelectorProps> = ({
  fontSize,
  onFontSizeChange,
}) => {
  return (
    <div className='flex items-center gap-3'>
      <label className='text-xl text-slate-400'>Text size:</label>
      <select
        value={fontSize}
        onChange={(e) =>
          onFontSizeChange(e.target.value as 'sm' | 'base' | 'lg' | 'xl')
        }
        className='px-3 py-1 rounded border border-slate-600 hover:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-600 transition bg-slate-800 text-white text-xs'
      >
        {FONT_SIZES.map((size) => (
          <option key={size.value} value={size.value}>
            {size.label}
          </option>
        ))}
      </select>
    </div>
  );
};
