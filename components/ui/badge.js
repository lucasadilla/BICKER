import React from 'react';

const variantStyles = {
  default: { backgroundColor: '#007bff', color: '#fff', border: '1px solid #007bff' },
  secondary: { backgroundColor: 'rgba(59,132,189,0)', color: '#fff', border: '0px solid #6c757d' },
  destructive: { backgroundColor: '#dc3545', color: '#fff', border: '1px solid #dc3545' },
  outline: { backgroundColor: 'transparent', color: 'rgba(108,117,125,0)', border: '1px solid #6c757d' },
};

export function Badge({ variant = 'default', className = '', style = {}, children, ...props }) {
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
