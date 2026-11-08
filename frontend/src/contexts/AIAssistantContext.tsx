import { createContext, useContext, useState, ReactNode } from 'react';

interface AIAssistantContextType {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const AIAssistantContext = createContext<AIAssistantContextType | undefined>(undefined);

export function AIAssistantProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <AIAssistantContext.Provider value={{ isOpen, setIsOpen }}>
      {children}
    </AIAssistantContext.Provider>
  );
}

export function useAIAssistant() {
  const context = useContext(AIAssistantContext);
  if (context === undefined) {
    throw new Error('useAIAssistant must be used within AIAssistantProvider');
  }
  return context;
}
