import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const colorScheme = useColorScheme();
  const [isDark, setIsDark] = useState(colorScheme === 'dark');

  useEffect(() => {
    setIsDark(colorScheme === 'dark');
  }, [colorScheme]);

  const theme = {
    isDark,
    // Background colors
    backgroundColor: isDark ? '#121212' : '#FFFFFF',
    cardBackground: isDark ? '#1E1E1E' : '#F5F5F5',
    secondaryBackground: isDark ? '#2D2D2D' : '#F0F0F0',
    modalBackground: isDark ? '#1A1A1A' : '#FFFFFF',
    
    // Text colors
    textColor: isDark ? '#FFFFFF' : '#000000',
    secondaryTextColor: isDark ? '#B0B0B0' : '#666666',
    placeholderTextColor: isDark ? '#808080' : '#999999',
    
    // Brand colors
    primaryColor: '#2196F3',
    secondaryColor: '#4CAF50',
    accentColor: '#FF4081',
    
    // Status colors
    successColor: '#4CAF50',
    errorColor: '#F44336',
    warningColor: '#FFC107',
    infoColor: '#2196F3',
    
    // Border colors
    borderColor: isDark ? '#333333' : '#E0E0E0',
    dividerColor: isDark ? '#404040' : '#E0E0E0',
    
    // Shadow colors
    shadowColor: isDark ? '#000000' : '#000000',
    
    // Typography
    fontSize: {
      xs: 12,
      sm: 14,
      md: 16,
      lg: 18,
      xl: 20,
      xxl: 24,
    },
    fontWeight: {
      regular: '400',
      medium: '500',
      bold: '700',
    },
    
    // Spacing
    spacing: {
      xs: 4,
      sm: 8,
      md: 16,
      lg: 24,
      xl: 32,
      xxl: 48,
    },
    
    // Border radius
    borderRadius: {
      sm: 4,
      md: 8,
      lg: 12,
      xl: 16,
      round: 9999,
    },
  };

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  const value = {
    theme,
    toggleTheme,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export default ThemeContext; 