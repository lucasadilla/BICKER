// pages/instigate/index.js
import { useState, useEffect } from 'react';
import { useColorScheme, useThemeColors } from '../lib/ColorSchemeContext';

export default function InstigatePage() {
    const [instigates, setInstigates] = useState([]);
    const [newInstigate, setNewInstigate] = useState('');
    const theme = useThemeColors();
    const { colorScheme } = useColorScheme();
    const isDark = colorScheme === 'dark';
    const isBlue = colorScheme === 'blue';

    // Disable scrolling on mount
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, []);

    useEffect(() => {
        fetchInstigates();
    }, []);

    const fetchInstigates = async () => {
        try {
            const response = await fetch('/api/instigate');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setInstigates(data);
        } catch (error) {
            console.error('Error fetching instigates:', error);
            alert('Failed to load instigates. Please try again later.');
        }
    };

    const submitInstigate = async () => {
        if (!newInstigate.trim()) {
            alert('Please provide text.');
            return;
        }

        try {
            const res = await fetch('/api/instigate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: newInstigate.trim() }),
            });
            if (!res.ok) {
                const data = await res.json();
                alert(data.error || 'Failed to submit instigate.');
                return;
            }
            setNewInstigate('');
            fetchInstigates();
        } catch (error) {
            console.error('Error submitting instigate:', error);
            alert('Failed to submit instigate. Please try again.');
        }
    };

    const highContrastOutline = isDark
        ? 'rgba(255, 255, 255, 0.7)'
        : isBlue
            ? 'rgba(245, 245, 245, 0.6)'
            : 'rgba(31, 31, 31, 0.35)';

    const counterColor = isDark
        ? 'rgba(255, 255, 255, 0.8)'
        : isBlue
            ? 'rgba(245, 245, 245, 0.8)'
            : 'rgba(0, 0, 0, 0.65)';

    const buttonShadow = isDark
        ? '0 12px 28px rgba(255, 255, 255, 0.12)'
        : isBlue
            ? '0 12px 30px rgba(0, 0, 0, 0.6)'
            : '0 12px 24px rgba(31, 31, 31, 0.18)';

    const buttonBackground = isDark ? '#ffffff' : theme.blue;
    const buttonHoverBackground = isDark ? '#e5e5e5' : theme.blueHover;
    const buttonText = isDark ? '#000000' : theme.blueText;
    const buttonBorder = isDark ? '2px solid rgba(255, 255, 255, 0.8)' : `2px solid ${highContrastOutline}`;

    return (
        <div
            style={{
                minHeight: '100vh',
                width: '100%',
                backgroundColor: theme.background,
                color: theme.text,
                padding: '120px 20px 60px',
                boxSizing: 'border-box',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'flex-start',
            }}
        >
            <div
                style={{
                    width: '100%',
                    maxWidth: '720px',
                    background: isDark
                        ? '#ffffff'
                        : `linear-gradient(135deg, ${theme.red} 0%, ${theme.blue} 100%)`,
                    padding: '3px',
                    borderRadius: '28px',
                    boxShadow: isDark
                        ? '0 18px 42px rgba(0, 0, 0, 0.85)'
                        : '0 18px 42px rgba(0,0,0,0.25)',
                }}
            >
                <div
                    data-instigate-card
                    style={{
                        backgroundColor: theme.surface,
                        borderRadius: '25px',
                        padding: '36px 32px',
                        boxShadow: theme.surfaceShadow,
                        border: `1px solid ${theme.surfaceBorder}`,
                        color: theme.surfaceText,
                    }}
                >
                    <h1
                        className="heading-1"
                        style={{
                            textAlign: 'center',
                            marginBottom: '24px',
                            color: theme.surfaceText,
                        }}
                    >
                        Instigate
                    </h1>

                    <p
                        style={{
                            textAlign: 'center',
                            marginBottom: '28px',
                            fontSize: '18px',
                            color: isDark
                                ? 'rgba(255, 255, 255, 0.75)'
                                : isBlue
                                    ? 'rgba(245, 245, 245, 0.75)'
                                    : 'rgba(31, 31, 31, 0.7)',
                        }}
                    >
                        Share the spark for a new debate. Keep it under 200 characters.
                    </p>

                    <div style={{ position: 'relative' }}>
                        <textarea
                            value={newInstigate}
                            onChange={(e) => setNewInstigate(e.target.value)}
                            placeholder="Write your opinion here (max 200 characters)"
                            maxLength={200}
                            style={{
                                width: '100%',
                                minHeight: '320px',
                                padding: '18px',
                                fontSize: '28px',
                                lineHeight: 1.3,
                                borderRadius: '18px',
                                border: `1px solid ${highContrastOutline}`,
                                resize: 'none',
                                backgroundColor: theme.inputBackground,
                                color: theme.inputText,
                                boxShadow: isDark
                                    ? '0 0 0 1px rgba(255, 255, 255, 0.18)'
                                    : isBlue
                                        ? '0 0 0 1px rgba(245, 245, 245, 0.12)'
                                        : '0 20px 45px rgba(31, 31, 31, 0.08)',
                                transition: 'box-shadow 0.2s ease, border-color 0.2s ease',
                            }}
                            onFocus={(e) => {
                                e.target.style.borderColor = isDark
                                    ? 'rgba(255, 255, 255, 0.85)'
                                    : isBlue
                                        ? 'rgba(255, 255, 255, 0.85)'
                                        : 'rgba(31, 31, 31, 0.55)';
                                e.target.style.boxShadow = isDark
                                    ? '0 0 0 2px rgba(255, 255, 255, 0.25)'
                                    : isBlue
                                        ? '0 0 0 2px rgba(255, 255, 255, 0.2)'
                                        : '0 24px 48px rgba(31, 31, 31, 0.12)';
                            }}
                            onBlur={(e) => {
                                e.target.style.borderColor = highContrastOutline;
                                e.target.style.boxShadow = isDark
                                    ? '0 0 0 1px rgba(255, 255, 255, 0.18)'
                                    : isBlue
                                        ? '0 0 0 1px rgba(245, 245, 245, 0.12)'
                                        : '0 20px 45px rgba(31, 31, 31, 0.08)';
                            }}
                        />
                        <div
                            style={{
                                position: 'absolute',
                                bottom: '18px',
                                right: '22px',
                                fontSize: '15px',
                                letterSpacing: '0.3px',
                                color: counterColor,
                                pointerEvents: 'none',
                            }}
                        >
                            {newInstigate.length}/200
                        </div>
                    </div>

                    <button
                        className="submit-topic-button"
                        onClick={submitInstigate}
                        style={{
                            width: '100%',
                            marginTop: '32px',
                            padding: '16px 20px',
                            background: buttonBackground,
                            color: buttonText,
                            fontSize: '22px',
                            fontWeight: 700,
                            borderRadius: '999px',
                            border: buttonBorder,
                            cursor: 'pointer',
                            boxShadow: buttonShadow,
                            transition: 'transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(2px) scale(0.99)';
                            e.currentTarget.style.boxShadow = isDark
                                ? '0 8px 18px rgba(255, 255, 255, 0.1)'
                                : isBlue
                                    ? '0 8px 20px rgba(0, 0, 0, 0.5)'
                                    : '0 10px 18px rgba(31, 31, 31, 0.15)';
                            e.currentTarget.style.background = buttonHoverBackground;
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0) scale(1)';
                            e.currentTarget.style.boxShadow = buttonShadow;
                            e.currentTarget.style.background = buttonBackground;
                        }}
                    >
                        Submit Topic
                    </button>
                </div>
            </div>

            <style jsx>{`
                @media (max-width: 768px) {
                    [data-instigate-card] {
                        padding: 28px 22px !important;
                    }

                    textarea {
                        font-size: 22px !important;
                        min-height: 240px !important;
                    }

                    .submit-topic-button {
                        margin-top: 24px !important;
                        font-size: 20px !important;
                    }
                }
            `}</style>
        </div>
    );
}
