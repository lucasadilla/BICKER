import { createContext, useContext } from 'react';

const COLOR_THEMES = {
  light: {
    background: '#f5f5f5',
    text: '#1f1f1f',
    surface: '#ffffff',
    surfaceText: '#1f1f1f',
    surfaceShadow: '0 1px 2px rgba(0,0,0,0.1)',
    surfaceBorder: 'rgba(15, 23, 42, 0.12)',
    red: '#FF4D4D',
    redHover: '#FF6A6A',
    redText: '#ffffff',
    blue: '#4D94FF',
    blueHover: '#76ACFF',
    blueText: '#ffffff',
    inputBackground: '#ffffff',
    inputText: '#1f1f1f',
    inputBorder: 'rgba(15, 23, 42, 0.12)',
    navButtonColor: '#ffffff',
    navButtonBorder: 'rgba(255, 255, 255, 0.7)',
    navButtonBorderHover: 'rgba(255, 255, 255, 0.9)',
  },
  dark: {
    background: '#1f1f1f',
    text: '#f5f5f5',
    surface: '#f5f5f5',
    surfaceText: '#1f1f1f',
    surfaceShadow: '0 2px 6px rgba(0,0,0,0.4)',
    surfaceBorder: 'rgba(0, 0, 0, 0.25)',
    red: '#000000',
    redHover: '#1a1a1a',
    redText: '#f5f5f5',
    blue: '#ffffff',
    blueHover: '#f2f2f2',
    blueText: '#000000',
    inputBackground: '#f5f5f5',
    inputText: '#1f1f1f',
    inputBorder: 'rgba(255, 255, 255, 0.3)',
    navButtonColor: '#111111',
    navButtonBorder: 'rgba(255, 255, 255, 0.7)',
    navButtonBorderHover: 'rgba(255, 255, 255, 0.9)',
  },
  blue: {
    background: '#001f3f',
    text: '#ffffff',
    surface: 'rgba(255, 255, 255, 0.1)',
    surfaceText: '#ffffff',
    surfaceShadow: '0 1px 2px rgba(0,0,0,0.3)',
    surfaceBorder: 'rgba(255, 255, 255, 0.2)',
    red: '#FF4D4D',
    redHover: '#FF6A6A',
    redText: '#ffffff',
    blue: '#4D94FF',
    blueHover: '#76ACFF',
    blueText: '#ffffff',
    inputBackground: 'rgba(255, 255, 255, 0.15)',
    inputText: '#ffffff',
    inputBorder: 'rgba(255, 255, 255, 0.4)',
    navButtonColor: '#ffffff',
    navButtonBorder: 'rgba(255, 255, 255, 0.7)',
    navButtonBorderHover: 'rgba(255, 255, 255, 0.9)',
  },
};

export const ColorSchemeContext = createContext({
  colorScheme: 'light',
  setColorScheme: () => {},
});

export function useColorScheme() {
  return useContext(ColorSchemeContext);
}

export function getThemeForScheme(scheme) {
  return COLOR_THEMES[scheme] || COLOR_THEMES.light;
}

export function useThemeColors() {
  const { colorScheme } = useColorScheme();
  return getThemeForScheme(colorScheme);
}

export const colorThemes = COLOR_THEMES;
