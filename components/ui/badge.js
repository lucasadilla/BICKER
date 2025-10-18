import React from 'react';
import { useThemeColors } from '../../lib/ColorSchemeContext';

const buildVariantStyles = (theme) => ({
  default: {
    backgroundColor: theme.blue,
    color: theme.blueText,
    border: `1px solid ${theme.blue}`,
  },
  secondary: {
    backgroundColor: 'transparent',
    color: theme.surfaceText,
    border: `1px solid ${theme.surfaceBorder}`,
  },
  destructive: {
    backgroundColor: theme.red,
    color: theme.redText,
    border: `1px solid ${theme.red}`,
  },
  outline: {
    backgroundColor: 'transparent',
    color: theme.surfaceText,
    border: `1px solid ${theme.surfaceBorder}`,
  },
});

export function Badge({ variant = 'default', className = '', style = {}, children, ...props }) {
  const theme = useThemeColors();
  const variantStyles = buildVariantStyles(theme);
  const baseStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    borderRadius: '9999px',
    padding: '2px 8px',
    fontSize: '0.75rem',
    fontWeight: 500,
  };
  const combinedStyle = { ...baseStyle, ...(variantStyles[variant] || variantStyles.default), ...style };
  return (
    <span style={combinedStyle} className={className} {...props}>
      {children}
    </span>
  );
}

export default Badge;
