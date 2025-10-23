import React from 'react';

const neutralVariantStyles = {
  'neutral-solid': {
    backgroundColor: 'var(--color-text, #1f1f1f)',
    color: 'var(--color-surface, #ffffff)',
    border: '1px solid var(--color-text, #1f1f1f)'
  },
  'neutral-soft': {
    backgroundColor: 'var(--color-surface, #ffffff)',
    color: 'var(--color-text, #1f1f1f)',
    border: '1px solid var(--color-border, #d4d4d8)'
  },
  'neutral-outline': {
    backgroundColor: 'transparent',
    color: 'var(--color-text, #1f1f1f)',
    border: '1px solid var(--color-border, #d4d4d8)'
  },
};

const legacyVariantMap = {
  default: 'neutral-solid',
  secondary: 'neutral-soft',
  destructive: 'neutral-solid',
  outline: 'neutral-outline',
};

export function Badge({ variant = 'neutral-solid', className = '', style = {}, children, ...props }) {
  const baseStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    borderRadius: '9999px',
    padding: '2px 8px',
    fontSize: '0.75rem',
    fontWeight: 500,
  };
  const resolvedVariantKey = neutralVariantStyles[variant]
    ? variant
    : legacyVariantMap[variant] || 'neutral-solid';
  const combinedStyle = {
    ...baseStyle,
    ...neutralVariantStyles[resolvedVariantKey],
    ...style,
  };
  return (
    <span style={combinedStyle} className={className} {...props}>
      {children}
    </span>
  );
}

export default Badge;
