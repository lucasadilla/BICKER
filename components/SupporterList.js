import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useState } from 'react';
import Link from 'next/link';

const defaultState = {
  supporters: [],
  supports: [],
  supporterCount: 0,
  supportsCount: 0,
  isSupporting: false,
  isSelf: false,
  supporterSummaries: [],
  supportSummaries: [],
};

const overlayStyles = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.6)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
  padding: '20px',
};

const modalStyles = {
  backgroundColor: '#ffffff',
  color: '#111111',
  width: '100%',
  maxWidth: '420px',
  borderRadius: '12px',
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
  maxHeight: '80vh',
};

const modalHeaderStyles = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '16px 20px',
  borderBottom: '1px solid rgba(0,0,0,0.08)',
  fontWeight: 600,
};

const listStyles = {
  listStyle: 'none',
  margin: 0,
  padding: 0,
  overflowY: 'auto',
};

const listItemStyles = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  padding: '12px 20px',
  borderBottom: '1px solid rgba(0,0,0,0.05)',
};

const avatarStyles = {
  width: '40px',
  height: '40px',
  borderRadius: '50%',
  objectFit: 'cover',
  backgroundColor: '#f2f2f2',
};

const buttonBaseStyles = {
  border: 'none',
  background: 'transparent',
  padding: 0,
  margin: 0,
  cursor: 'pointer',
};

const CounterButton = ({ label, count, onClick, textColor, borderColor }) => (
  <button
    onClick={onClick}
    style={{
      ...buttonBaseStyles,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '8px 12px',
      borderRadius: '12px',
      border: `1px solid ${borderColor || 'rgba(255,255,255,0.3)'}`,
      color: textColor || '#ffffff',
      backgroundColor: 'rgba(0,0,0,0.15)',
      minWidth: '110px',
    }}
    type="button"
  >
    <span style={{ fontSize: '1.2rem', fontWeight: 600 }}>{count}</span>
    <span style={{ fontSize: '0.85rem' }}>{label}</span>
  </button>
);

const buildListContent = (summaries, emptyStateMessage, darkMode) => {
  if (!Array.isArray(summaries) || summaries.length === 0) {
    return (
      <li style={{ padding: '20px', textAlign: 'center', color: '#555555' }}>
        {emptyStateMessage || 'No accounts yet.'}
      </li>
    );
  }

  return summaries.map((entry) => {
    const { email, displayName, profilePicture, profilePath } = entry;
    return (
      <li key={email} style={listItemStyles}>
        {profilePicture ? (
          <img
            src={profilePicture}
            alt={displayName}
            style={avatarStyles}
          />
        ) : (
          <div
            style={{
              ...avatarStyles,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 600,
              color: darkMode ? '#e5e7eb' : '#374151',
              backgroundColor: darkMode ? '#1f2937' : '#f2f2f2',
            }}
            aria-hidden="true"
          >
            {displayName ? displayName.charAt(0).toUpperCase() : '?'}
          </div>
        )}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <Link
            href={profilePath}
            style={{
              fontWeight: 600,
              color: darkMode ? '#f9fafb' : '#1f2937',
              textDecoration: 'none',
            }}
          >
            {displayName}
          </Link>
          <span style={{ fontSize: '0.8rem', color: darkMode ? '#9ca3af' : '#6b7280' }}>{email}</span>
        </div>
      </li>
    );
  });
};

const SupporterList = forwardRef(function SupporterList(
  {
    identifier,
    textColor,
    borderColor,
    onDataUpdate,
    autoFetch = true,
    emptyStateMessage,
    darkMode = false,
  },
  ref
) {
  const [data, setDataState] = useState(defaultState);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeModal, setActiveModal] = useState(null);

  const fetchData = useCallback(async () => {
    if (!identifier) {
      return null;
    }
    setIsLoading(true);
    setError('');
    try {
      const res = await fetch('/api/user/supports?identifier=' + encodeURIComponent(identifier));
      if (!res.ok) {
        if (res.status === 401) {
          setError('Sign in to view supporters.');
          setDataState(defaultState);
          onDataUpdate?.({ ...defaultState, isSelf: false });
          return null;
        }
        throw new Error('Failed to load supporters');
      }
      const payload = await res.json();
      setDataState(payload);
      onDataUpdate?.(payload);
      return payload;
    } catch (err) {
      console.error(err);
      setError('Unable to load supporter information.');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [identifier, onDataUpdate]);

  useEffect(() => {
    if (autoFetch) {
      fetchData();
    }
  }, [autoFetch, fetchData]);

  useImperativeHandle(ref, () => ({
    refresh: fetchData,
    setData: (next) => {
      setDataState((prev) => {
        const merged = { ...prev, ...next };
        onDataUpdate?.(merged);
        return merged;
      });
    },
    openSupporters: () => setActiveModal('supporters'),
    openSupports: () => setActiveModal('supports'),
    getData: () => data,
  }), [data, fetchData, onDataUpdate]);

  const supporterSummaries = useMemo(() => data.supporterSummaries || [], [data.supporterSummaries]);
  const supportSummaries = useMemo(() => data.supportSummaries || [], [data.supportSummaries]);

  const counters = (
    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
      <CounterButton
        label="Supporters"
        count={data.supporterCount || 0}
        onClick={() => setActiveModal('supporters')}
        textColor={textColor}
        borderColor={borderColor}
      />
      <CounterButton
        label="Supports"
        count={data.supportsCount || 0}
        onClick={() => setActiveModal('supports')}
        textColor={textColor}
        borderColor={borderColor}
      />
    </div>
  );

  const themedModalStyles = darkMode
    ? {
        ...modalStyles,
        backgroundColor: '#111111',
        color: '#f5f5f5',
        border: '1px solid #1f2937',
      }
    : modalStyles;

  const themedListStyles = darkMode
    ? { ...listStyles, backgroundColor: '#111111' }
    : listStyles;

  const themedHeaderStyles = darkMode
    ? { ...modalHeaderStyles, borderBottom: '1px solid rgba(255,255,255,0.08)', color: '#f9fafb' }
    : modalHeaderStyles;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {counters}
      {isLoading && <span style={{ color: textColor || '#ffffff', fontSize: '0.9rem' }}>Loading supporters…</span>}
      {error && <span style={{ color: '#f87171', fontSize: '0.85rem' }}>{error}</span>}
      {activeModal && (
        <div style={overlayStyles} role="dialog" aria-modal="true">
          <div style={themedModalStyles}>
            <div style={themedHeaderStyles}>
              <span>{activeModal === 'supporters' ? 'Supporters' : 'Supports'}</span>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                style={{
                  ...buttonBaseStyles,
                  fontSize: '1.5rem',
                  lineHeight: 1,
                  color: '#6b7280',
                }}
                aria-label="Close supporters modal"
              >
                ×
              </button>
            </div>
            <ul style={themedListStyles}>
              {activeModal === 'supporters'
                ? buildListContent(supporterSummaries, emptyStateMessage, darkMode)
                : buildListContent(supportSummaries, emptyStateMessage, darkMode)}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
});

export default SupporterList;
