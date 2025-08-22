import { createContext, useContext } from 'react';

export const ColorSchemeContext = createContext({
  colorScheme: 'light',
  setColorScheme: () => {},
});

export function useColorScheme() {
  return useContext(ColorSchemeContext);
}
