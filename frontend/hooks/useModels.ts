import { useState, useEffect, useCallback } from 'react';

export interface ModelInfo {
  name: string;
  description: string;
}

export interface AvailableModels {
  [company: string]: {
    [modelId: string]: ModelInfo;
  };
}

export const useModels = () => {
  const [selectedCompany, setSelectedCompany] = useState('Google');
  const [selectedModel, setSelectedModel] = useState('gemini-2.0-flash');
  const [availableModels, setAvailableModels] = useState<AvailableModels>({});

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

  const handleCompanyChange = useCallback(
    (company: string) => {
      setSelectedCompany(company);
      // Автоматично избери първия модел от новата компания
      const modelsForCompany = availableModels[company];
      if (modelsForCompany) {
        const firstModelId = Object.keys(modelsForCompany)[0];
        setSelectedModel(firstModelId);
      }
    },
    [availableModels]
  );

  const getCompanies = useCallback(() => {
    return Object.keys(availableModels);
  }, [availableModels]);

  const getModelsForCompany = useCallback(
    (company: string) => {
      return availableModels[company] || {};
    },
    [availableModels]
  );

  return {
    selectedCompany,
    setSelectedCompany: handleCompanyChange,
    selectedModel,
    setSelectedModel,
    availableModels,
    getCompanies,
    getModelsForCompany,
  };
};
