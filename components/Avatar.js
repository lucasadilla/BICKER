import React from 'react';

export default function Avatar({ src, alt, size = 44 }) {
  const dimension = typeof size === 'number' ? size : 44;
  const initials = alt ? alt.charAt(0).toUpperCase() : '?';
  return (
    <div
      className="preserve-color"
      style={{
        width: dimension,
        height: dimension,
        borderRadius: '50%',
        overflow: 'hidden',
        backgroundColor: '#ccc',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 'bold',
        color: '#fff'
      }}
    >
      {src ? (
        <img
          className="preserve-color"
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
