import React from 'react';

interface ModelSelectorProps {
  selectedCompany: string;
  selectedModel: string;
  companies: string[];
  modelsForCompany: Record<string, { name: string; description: string }>;
  onCompanyChange: (company: string) => void;
  onModelChange: (model: string) => void;
  compact?: boolean;
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({
  selectedCompany,
  selectedModel,
  companies,
  modelsForCompany,
  onCompanyChange,
  onModelChange,
  compact = false,
}) => {
  return (
    <div className={compact ? 'flex gap-2 max-w-sm' : 'flex gap-3'}>
      {/* Company Selector */}
      <select
        value={selectedCompany}
        onChange={(e) => onCompanyChange(e.target.value)}
        className={`px-3 rounded border border-slate-600 hover:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-600 transition bg-slate-800 text-white ${
          compact ? 'py-1 text-xs flex-1' : 'py-2 text-sm flex-1'
        }`}
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
        className={`px-3 rounded border border-slate-600 hover:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-600 transition bg-slate-800 text-white ${
          compact ? 'py-1 text-xs flex-1' : 'py-2 text-sm flex-1'
        }`}
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
