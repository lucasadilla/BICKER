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
    navButtonColor: '#1f1f1f',
    navButtonColorHover: '#1f1f1f',
    navButtonBorder: 'rgba(31, 31, 31, 0.6)',
    navButtonBorderHover: 'rgba(31, 31, 31, 0.85)',
  },
  dark: {
    background: '#000000',
    text: '#ffffff',
    surface: '#0f0f0f',
    surfaceText: '#ffffff',
    surfaceShadow: '0 10px 30px rgba(0,0,0,0.8)',
    surfaceBorder: 'rgba(255, 255, 255, 0.2)',
    red: '#ffffff',
    redHover: '#e5e5e5',
    redText: '#000000',
    blue: '#090909',
    blueHover: '#141414',
    blueText: '#ffffff',
    inputBackground: '#050505',
    inputText: '#ffffff',
    inputBorder: 'rgba(255, 255, 255, 0.35)',
    navButtonColor: '#ffffff',
    navButtonColorHover: '#ffffff',
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
    navButtonColorHover: '#ffffff',
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
