import React, { useMemo } from 'react';
import { useColorScheme } from '../lib/ColorSchemeContext';

export default function Avatar({ src, alt, size = 44 }) {
  const dimension = typeof size === 'number' ? size : 44;
  const initials = alt ? alt.charAt(0).toUpperCase() : '?';
  const { colorScheme } = useColorScheme() || { colorScheme: 'light' };
  const fallbackColors = useMemo(() => {
    if (colorScheme === 'monochrome') {
      return {
        backgroundColor: 'var(--color-surface, #000000)',
        color: 'var(--color-text, #ffffff)'
      };
    }
    return {
      backgroundColor: 'var(--color-border, #d4d4d8)',
      color: 'var(--color-text, #1f1f1f)'
    };
  }, [colorScheme]);
  return (
    <div
      style={{
        width: dimension,
        height: dimension,
        borderRadius: '50%',
        overflow: 'hidden',
        backgroundColor: fallbackColors.backgroundColor,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 'bold',
        color: fallbackColors.color
      }}
    >
      {src ? (
        <img
          src={src}
          alt={alt}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
}
