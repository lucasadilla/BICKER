import { createContext, useContext } from 'react';

export const ColorSchemeContext = createContext({
  colorScheme: 'default',
  setColorScheme: () => {},
});

export function useColorScheme() {
  return useContext(ColorSchemeContext);
}
