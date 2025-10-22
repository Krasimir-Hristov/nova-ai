import React from 'react';

interface ModelSelectorProps {
  selectedCompany: string;
  selectedModel: string;
  companies: string[];
  modelsForCompany: Record<string, { name: string; description: string }>;
  onCompanyChange: (company: string) => void;
  onModelChange: (model: string) => void;
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({
  selectedCompany,
  selectedModel,
  companies,
  modelsForCompany,
  onCompanyChange,
  onModelChange,
}) => {
  return (
    <div className='flex gap-3'>
      {/* Company Selector */}
      <select
        value={selectedCompany}
        onChange={(e) => onCompanyChange(e.target.value)}
        className='flex-1 px-3 py-2 bg-slate-800 text-white text-sm rounded border border-slate-600 hover:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-600 transition'
      >
        {companies.map((company) => (
          <option key={company} value={company}>
            {company}
          </option>
        ))}
      </select>

      {/* Model Selector */}
      <select
        value={selectedModel}
        onChange={(e) => onModelChange(e.target.value)}
        className='flex-1 px-3 py-2 bg-slate-800 text-white text-sm rounded border border-slate-600 hover:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-600 transition'
      >
        {Object.entries(modelsForCompany).map(([modelId, modelInfo]) => (
          <option key={modelId} value={modelId}>
            {modelInfo.name} - {modelInfo.description}
          </option>
        ))}
      </select>
    </div>
  );
};
