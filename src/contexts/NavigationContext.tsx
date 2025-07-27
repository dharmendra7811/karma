import React, { createContext, useContext, ReactNode } from 'react';

interface NavigationContextType {
  navigate: (tab: string) => void;
  currentTab: string;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

interface NavigationProviderProps {
  children: ReactNode;
  navigate: (tab: string) => void;
  currentTab: string;
}

export const NavigationProvider: React.FC<NavigationProviderProps> = ({
  children,
  navigate,
  currentTab,
}) => {
  return (
    <NavigationContext.Provider value={{ navigate, currentTab }}>
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};
