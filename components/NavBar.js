import Link from 'next/link';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/router';
import { signIn, signOut, useSession } from 'next-auth/react';
import Avatar from './Avatar';
import { useColorScheme } from '../lib/ColorSchemeContext';

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const parseHexColor = (hex) => {
    const normalized = hex.replace('#', '').trim();
    if (![3, 4, 6, 8].includes(normalized.length)) {
        return null;
    }
    const expand = (value) => value.split('').map((char) => `${char}${char}`).join('');
    const value =
        normalized.length === 3 || normalized.length === 4
            ? expand(normalized.slice(0, 3))
            : normalized.slice(0, 6);
    const r = parseInt(value.slice(0, 2), 16);
    const g = parseInt(value.slice(2, 4), 16);
    const b = parseInt(value.slice(4, 6), 16);
    return { r, g, b };
};

const parseRgbColor = (input) => {
    const match = input
        .replace(/\s+/g, '')
        .match(/rgba?\(([-+\d.]+),([-+\d.]+),([-+\d.]+)(?:,([-+\d.]+))?\)/i);
    if (!match) {
        return null;
    }
    const r = clamp(Math.round(parseFloat(match[1])), 0, 255);
    const g = clamp(Math.round(parseFloat(match[2])), 0, 255);
    const b = clamp(Math.round(parseFloat(match[3])), 0, 255);
    const alpha = match[4] !== undefined ? clamp(parseFloat(match[4]), 0, 1) : 1;
    return alpha === 1
        ? { r, g, b }
        : { r: Math.round(r * alpha), g: Math.round(g * alpha), b: Math.round(b * alpha) };
};

const hslToRgb = (h, s, l) => {
    const hueToRgb = (p, q, t) => {
        let temp = t;
        if (temp < 0) temp += 1;
        if (temp > 1) temp -= 1;
        if (temp < 1 / 6) return p + (q - p) * 6 * temp;
        if (temp < 1 / 2) return q;
        if (temp < 2 / 3) return p + (q - p) * (2 / 3 - temp) * 6;
        return p;
    };

    const saturation = s / 100;
    const lightness = l / 100;

    const q =
        lightness < 0.5
            ? lightness * (1 + saturation)
            : lightness + saturation - lightness * saturation;
    const p = 2 * lightness - q;
    const hk = (h % 360) / 360;

    const r = Math.round(hueToRgb(p, q, hk + 1 / 3) * 255);
    const g = Math.round(hueToRgb(p, q, hk) * 255);
    const b = Math.round(hueToRgb(p, q, hk - 1 / 3) * 255);

    return { r: clamp(r, 0, 255), g: clamp(g, 0, 255), b: clamp(b, 0, 255) };
};

const parseHslColor = (input) => {
    const match = input
        .replace(/\s+/g, '')
        .match(/hsla?\(([-+\d.]+),([-+\d.]+)%,([-+\d.]+)%(?:,([-+\d.]+))?\)/i);
    if (!match) {
        return null;
    }
    const h = parseFloat(match[1]);
    const s = clamp(parseFloat(match[2]), 0, 100);
    const l = clamp(parseFloat(match[3]), 0, 100);
    const alpha = match[4] !== undefined ? clamp(parseFloat(match[4]), 0, 1) : 1;
    const { r, g, b } = hslToRgb(h, s, l);
    if (alpha === 1) {
        return { r, g, b };
    }
    return {
        r: Math.round(r * alpha),
        g: Math.round(g * alpha),
        b: Math.round(b * alpha),
    };
};

const parseColorString = (value) => {
    if (!value) {
        return null;
    }
    const trimmed = value.trim();
    if (trimmed.startsWith('#')) {
        return parseHexColor(trimmed);
    }
    if (trimmed.toLowerCase().startsWith('rgb')) {
        return parseRgbColor(trimmed);
    }
    if (trimmed.toLowerCase().startsWith('hsl')) {
        return parseHslColor(trimmed);
    }
    return null;
};

const splitGradientParts = (input) => {
    const parts = [];
    let buffer = '';
    let depth = 0;
    for (let i = 0; i < input.length; i += 1) {
        const char = input[i];
        if (char === '(') {
            depth += 1;
        }
        if (char === ')') {
            depth = Math.max(0, depth - 1);
        }
        if (char === ',' && depth === 0) {
            parts.push(buffer.trim());
            buffer = '';
            continue;
        }
        buffer += char;
    }
    if (buffer.trim()) {
        parts.push(buffer.trim());
    }
    return parts;
};

const parseLinearGradientStops = (gradient) => {
    if (!gradient) {
        return null;
    }
    const match = gradient.match(/linear-gradient\((.*)\)/i);
    if (!match) {
        return null;
    }
    const content = match[1];
    const segments = splitGradientParts(content);
    if (!segments.length) {
        return null;
    }

    const stops = [];
    const parts = segments[0].toLowerCase().startsWith('to ')
        ? segments.slice(1)
        : segments[0].match(/deg|rad|turn/)
            ? segments.slice(1)
            : segments;

    parts.forEach((part) => {
        const colorMatch = part.match(/(rgba?\([^\)]*\)|hsla?\([^\)]*\)|#[0-9a-fA-F]{3,8})/);
        if (!colorMatch) {
            return;
        }
        const color = parseColorString(colorMatch[1]);
        if (!color) {
            return;
        }
        const remainder = part.slice(colorMatch.index + colorMatch[0].length);
        const positionMatch = remainder.match(/([-+]?\d*\.?\d+)%/);
        stops.push({
            color,
            position: positionMatch ? clamp(parseFloat(positionMatch[1]) / 100, 0, 1) : null,
        });
    });

    if (!stops.length) {
        return null;
    }

    // Fill in missing positions by distributing evenly between known stops.
    let lastKnownIndex = -1;
    for (let i = 0; i < stops.length; i += 1) {
        if (stops[i].position !== null) {
            if (lastKnownIndex >= 0 && i - lastKnownIndex > 1) {
                const start = stops[lastKnownIndex].position ?? 0;
                const end = stops[i].position;
                const gap = i - lastKnownIndex;
                for (let j = 1; j < gap; j += 1) {
                    stops[lastKnownIndex + j].position = start + ((end - start) * j) / gap;
                }
            }
            lastKnownIndex = i;
        }
    }

    if (lastKnownIndex === -1) {
        const step = stops.length === 1 ? 0 : 1 / (stops.length - 1);
        stops.forEach((stop, index) => {
            stop.position = index * step;
        });
    } else {
        for (let i = 0; i < stops.length; i += 1) {
            if (stops[i].position === null) {
                stops[i].position = stops[Math.max(lastKnownIndex, 0)].position ?? 0;
            }
        }
    }

    return stops.sort((a, b) => a.position - b.position);
};

const getColorAtPosition = (stops, position) => {
    if (!stops || !stops.length) {
        return { r: 0, g: 0, b: 0 };
    }
    if (stops.length === 1) {
        return stops[0].color;
    }
    const target = clamp(position, 0, 1);
    for (let i = 1; i < stops.length; i += 1) {
        const current = stops[i];
        const previous = stops[i - 1];
        if (target <= current.position) {
            const span = current.position - previous.position;
            const t = span === 0 ? 0 : (target - previous.position) / span;
            const r = Math.round(previous.color.r + (current.color.r - previous.color.r) * t);
            const g = Math.round(previous.color.g + (current.color.g - previous.color.g) * t);
            const b = Math.round(previous.color.b + (current.color.b - previous.color.b) * t);
            return { r, g, b };
        }
    }
    return stops[stops.length - 1].color;
};

const getRelativeLuminance = ({ r, g, b }) => {
    const srgb = [r, g, b].map((channel) => {
        const normalized = channel / 255;
        return normalized <= 0.03928
            ? normalized / 12.92
            : Math.pow((normalized + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * srgb[0] + 0.7152 * srgb[1] + 0.0722 * srgb[2];
};

const pickContrastingColor = (rgb) => (getRelativeLuminance(rgb) > 0.55 ? '#000000' : '#ffffff');

const getCssVariableValue = (styles, name, fallback) => {
    const value = styles.getPropertyValue(name);
    return value ? value.trim() : fallback;
};

export default function NavBar() {
    const { data: session } = useSession();
    const router = useRouter();
    const { colorScheme } = useColorScheme();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showNotifications, setShowNotifications] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [profilePicture, setProfilePicture] = useState('');
    const userMenuRef = useRef(null);
    const notificationRef = useRef(null);
    const mobileMenuRef = useRef(null);
    const navRef = useRef(null);
    const gradientStopsRef = useRef(null);
    const [isNavBackgroundLight, setIsNavBackgroundLight] = useState(false);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
                setShowUserMenu(false);
            }
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setShowNotifications(false);
            }
            if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target) && !event.target.closest('.hamburger-button')) {
                setIsMobileMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('touchstart', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('touchstart', handleClickOutside);
        };
    }, []);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        
        checkMobile();
        window.addEventListener('resize', checkMobile);
        
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        if (session) {
            fetch('/api/notifications?limit=3')
                .then(res => res.json())
                .then(data => {
                    setNotifications((data.notifications || []).slice(0, 3));
                    setUnreadCount(data.unreadCount);
                })
                .catch(() => {});
            fetch('/api/profile')
                .then(res => res.json())
                .then(data => setProfilePicture(data.profilePicture || ''))
                .catch(() => {});
        }
    }, [session]);

    const handleBellClick = async () => {
        const newState = !showNotifications;
        setShowNotifications(newState);
        if (!showNotifications && unreadCount > 0) {
            const ids = notifications.filter(n => !n.read).map(n => n._id);
            await fetch('/api/notifications', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids })
            });
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            setUnreadCount(prev => Math.max(0, prev - ids.length));
        }
    };

    const navTextColor = 'var(--nav-button-text, #ffffff)';
    const isDarkMode = colorScheme === 'dark';
    const defaultBorderColor = 'var(--nav-button-border, rgba(255, 255, 255, 0.6))';
    const defaultHoverBorderColor = 'var(--nav-button-border-hover, rgba(255, 255, 255, 0.85))';

    const dropdownSurfaceStyle = {
        marginTop: '10px',
        backgroundColor: isDarkMode ? '#f5f5f5' : '#ffffff',
        color: '#000000',
        padding: '10px 20px',
        boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
        borderRadius: '8px',
        minWidth: '160px',
        zIndex: 1000,
    };

    // Common button style
    const buttonStyle = {
        padding: '10px 20px',
        fontSize: '16px',
        fontWeight: 'bold',
        borderWidth: '2px',
        borderStyle: 'solid',
        borderColor: defaultBorderColor,
        borderRadius: '999px',
        backgroundColor: 'transparent',
        color: navTextColor,
        cursor: 'pointer',
        transition: 'transform 0.15s ease, border-color 0.15s ease, color 0.15s ease',
        marginLeft: '20px',
        position: 'relative',
        backdropFilter: 'blur(4px)'
    };

    // Hover effects
    const handleMouseEnter = (e) => {
        const target = e.currentTarget;
        target.style.transform = 'translateY(2px) scale(0.98)';
        target.style.borderColor = target.dataset.hoverBorderColor || defaultHoverBorderColor;
        const hoverTextColor = target.dataset.hoverTextColor || target.dataset.textColor || navTextColor;
        target.style.color = hoverTextColor;
    };
    const handleMouseLeave = (e) => {
        const target = e.currentTarget;
        target.style.transform = 'translateY(0)';
        target.style.borderColor = target.dataset.borderColor || defaultBorderColor;
        target.style.color = target.dataset.textColor || navTextColor;
    };

    const handleCircularMouseEnter = (e) => {
        handleMouseEnter(e);
    };
    const handleCircularMouseLeave = (e) => {
        handleMouseLeave(e);
    };

    const updateButtonColors = useCallback(() => {
        if (typeof window === 'undefined' || !navRef.current) {
            return;
        }

        const buttons = navRef.current.querySelectorAll('button[data-uses-dynamic-color="true"]');
        if (!buttons.length) {
            return;
        }

        const rootStyles = getComputedStyle(document.documentElement);
        const fallbackTextColor = getCssVariableValue(rootStyles, '--nav-button-text', '#ffffff');
        const fallbackBorderColor = getCssVariableValue(rootStyles, '--nav-button-border', 'rgba(255, 255, 255, 0.6)');
        const fallbackHoverBorderColor = getCssVariableValue(rootStyles, '--nav-button-border-hover', 'rgba(255, 255, 255, 0.85)');

        const applyFallback = () => {
            buttons.forEach((button) => {
                button.style.color = fallbackTextColor;
                button.dataset.textColor = fallbackTextColor;
                button.style.borderColor = fallbackBorderColor;
                button.dataset.borderColor = fallbackBorderColor;
                button.dataset.hoverBorderColor = fallbackHoverBorderColor;
                button.dataset.hoverTextColor = fallbackTextColor;
            });
        };

        const stops = gradientStopsRef.current;

        if (!isDarkMode || !stops || !stops.length) {
            applyFallback();
            return;
        }

        buttons.forEach((button) => {
            const rect = button.getBoundingClientRect();
            if (!rect || (rect.width === 0 && rect.height === 0)) {
                return;
            }
            const centerX = rect.left + rect.width / 2;
            const ratio = window.innerWidth ? clamp(centerX / window.innerWidth, 0, 1) : 0;
            const backgroundColor = getColorAtPosition(stops, ratio);
            const textColor = pickContrastingColor(backgroundColor);
            const borderColor = textColor === '#000000' ? 'rgba(0, 0, 0, 0.6)' : fallbackBorderColor;
            const hoverBorderColor = textColor === '#000000' ? 'rgba(0, 0, 0, 0.85)' : fallbackHoverBorderColor;

            button.style.color = textColor;
            button.dataset.textColor = textColor;
            button.style.borderColor = borderColor;
            button.dataset.borderColor = borderColor;
            button.dataset.hoverBorderColor = hoverBorderColor;
            button.dataset.hoverTextColor = textColor;
        });
    }, [isDarkMode]);

    useEffect(() => {
        if (typeof window === 'undefined') {
            return undefined;
        }

        const root = document.documentElement;

        const updateGradientData = () => {
            const styles = getComputedStyle(root);
            const gradientValue = styles.getPropertyValue('--nav-gradient').trim();
            const parsedStops = gradientValue ? parseLinearGradientStops(gradientValue) : null;
            gradientStopsRef.current = parsedStops && parsedStops.length ? parsedStops : null;

            if (isDarkMode && gradientStopsRef.current && gradientStopsRef.current.length) {
                const midColor = getColorAtPosition(gradientStopsRef.current, 0.5);
                const luminance = getRelativeLuminance(midColor);
                setIsNavBackgroundLight(luminance > 0.6);
            } else {
                setIsNavBackgroundLight(false);
            }
        };

        updateGradientData();
        updateButtonColors();

        let observer;
        if (typeof MutationObserver !== 'undefined') {
            observer = new MutationObserver(() => {
                updateGradientData();
                updateButtonColors();
            });
            observer.observe(root, { attributes: true, attributeFilter: ['style'] });
        }

        const handleResize = () => {
            updateGradientData();
            updateButtonColors();
        };
        window.addEventListener('resize', handleResize);

        return () => {
            if (observer) {
                observer.disconnect();
            }
            window.removeEventListener('resize', handleResize);
        };
    }, [isDarkMode, router.pathname, updateButtonColors]);

    useEffect(() => {
        updateButtonColors();
    }, [
        updateButtonColors,
        isMobile,
        isMobileMenuOpen,
        showNotifications,
        showUserMenu,
        session,
        notifications.length,
    ]);

    const mobileMenuBackground = isDarkMode && isNavBackgroundLight
        ? 'rgba(255, 255, 255, 0.9)'
        : 'rgba(0, 0, 0, 0.8)';
    const mobileMenuTextColor = isDarkMode && isNavBackgroundLight ? '#000000' : navTextColor;
    const mobileMenuBorderColor = isDarkMode && isNavBackgroundLight
        ? 'rgba(0, 0, 0, 0.6)'
        : defaultBorderColor;

    return (
        <nav
            ref={navRef}
            style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '20px',
                padding: '10px 0',
                transition: 'background 0.3s ease',
                background: 'transparent',
                position: 'fixed',
                top: 0,
                width: '100%',
                zIndex: 1000,
            }}
        >
            {/* Home button */}
            <Link href="/" passHref>
                <button
                    style={{
                        ...buttonStyle,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: isMobile ? '15px' : '10px',
                        marginLeft: '0',
                        position: 'absolute',
                        left: '20px',
                        width: isMobile ? '54px' : '44px',
                        height: isMobile ? '54px' : '44px',
                        borderRadius: '50%',
                        backgroundColor: 'transparent',
                        borderColor: defaultBorderColor,
                        color: navTextColor
                    }}
                    onMouseEnter={handleCircularMouseEnter}
                    onMouseLeave={handleCircularMouseLeave}
                    data-border-color={defaultBorderColor}
                    data-text-color={navTextColor}
                    data-hover-border-color={defaultHoverBorderColor}
                    data-hover-text-color={navTextColor}
                    data-uses-dynamic-color="true"
                >
                    <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        width={isMobile ? "28" : "24"} 
                        height={isMobile ? "28" : "24"} 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                    >
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                        <polyline points="9 22 9 12 15 12 15 22"></polyline>
                    </svg>
                </button>
            </Link>

            {/* User profile picture */}
            {session && (
                <div
                    ref={userMenuRef}
                    style={{
                        position: 'absolute',
                        right: isMobile ? '80px' : '20px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-end'
                    }}
                >
                    <div
                        style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                        onClick={() => setShowUserMenu(prev => !prev)}
                    >
                        <Avatar
                            src={profilePicture || session.user?.image}
                            alt={session.user?.name || 'User Avatar'}
                            size={isMobile ? 54 : 44}
                        />
                    </div>
                    {showUserMenu && (
                        <div
                            style={dropdownSurfaceStyle}
                        >
                            <Link href="/my-stats" passHref>
                                <div
                                    style={{
                                        padding: '8px 0',
                                        cursor: 'pointer',
                                        whiteSpace: 'nowrap',
                                        color: '#000000'
                                    }}
                                >
                                    My Stats
                                </div>
                            </Link>
                            <Link href="/profile" passHref>
                                <div
                                    style={{
                                        padding: '8px 0',
                                        cursor: 'pointer',
                                        whiteSpace: 'nowrap',
                                        color: '#000000'
                                    }}
                                >
                                    Edit Profile
                                </div>
                            </Link>
                            <div
                                style={{ padding: '8px 0', cursor: 'pointer', whiteSpace: 'nowrap', color: '#000000' }}
                                onClick={() => signOut()}
                            >
                                Sign Out
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Notification bell */}
            {session && (
                <div
                    ref={notificationRef}
                    style={{
                        position: 'absolute',
                        right: isMobile ? '140px' : '80px'
                    }}
                >
                    <button
                        style={{
                            ...buttonStyle,
                            position: 'relative',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: isMobile ? '15px' : '10px',
                            width: isMobile ? '54px' : '44px',
                            height: isMobile ? '54px' : '44px',
                            borderRadius: '50%',
                            backgroundColor: 'transparent',
                            borderColor: defaultBorderColor,
                            color: navTextColor
                        }}
                        onMouseEnter={handleCircularMouseEnter}
                        onMouseLeave={handleCircularMouseLeave}
                        data-border-color={defaultBorderColor}
                        data-hover-border-color={defaultHoverBorderColor}
                        data-text-color={navTextColor}
                        data-hover-text-color={navTextColor}
                        data-uses-dynamic-color="true"
                        onClick={handleBellClick}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width={isMobile ? '28' : '24'}
                            height={isMobile ? '28' : '24'}
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"></path>
                            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                        </svg>
                        {unreadCount > 0 && (
                            <span
                                style={{
                                    position: 'absolute',
                                    top: '-2px',
                                    right: '-2px',
                                    transform: 'translate(50%, -50%)',
                                    backgroundColor: 'red',
                                    color: 'white',
                                    borderRadius: '999px',
                                    padding: '2px 6px',
                                    fontSize: '12px',
                                    minWidth: '20px',
                                    height: '20px',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    lineHeight: 1,
                                    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.2)'
                                }}
                            >
                                {unreadCount}
                            </span>
                        )}
                    </button>
                    {showNotifications && (
                        <div
                            style={{
                                position: 'absolute',
                                top: '60px',
                                right: '0',
                                backgroundColor: isDarkMode ? '#f5f5f5' : '#ffffff',
                                color: '#000000',
                                padding: '10px',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                width: '250px',
                                borderRadius: '8px',
                                zIndex: 1000
                            }}
                        >
                            {notifications.length === 0 ? (
                                <div style={{ padding: '10px', color: '#000000' }}>No notifications</div>
                            ) : (
                                <>
                                    {notifications.map((n) => {
                                        const href = n.link
                                            ? n.link
                                            : n.debateId
                                                ? `/deliberate?id=${encodeURIComponent(n.debateId)}`
                                                : null;

                                        const baseStyle = {
                                            borderBottom: '1px solid #eee',
                                            padding: '8px 0',
                                            color: '#000000',
                                            display: 'block',
                                            textDecoration: 'none'
                                        };

                                        if (!href) {
                                            return (
                                                <div key={n._id} style={baseStyle}>
                                                    {n.message}
                                                </div>
                                            );
                                        }

                                        return (
                                            <Link
                                                key={n._id}
                                                href={href}
                                                style={{ ...baseStyle, cursor: 'pointer' }}
                                                onClick={() => setShowNotifications(false)}
                                            >
                                                {n.message}
                                            </Link>
                                        );
                                    })}
                                    <Link
                                        href="/notifications"
                                        style={{
                                            display: 'block',
                                            marginTop: '10px',
                                            textAlign: 'center',
                                            color: '#1a73e8',
                                            fontWeight: 600,
                                            textDecoration: 'none'
                                        }}
                                        onClick={() => setShowNotifications(false)}
                                    >
                                        See all notifications
                                    </Link>
                                </>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Mobile menu button */}
            {isMobile && (
                <div
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className={`hamburger-button ${isMobileMenuOpen ? 'open' : ''}`}
                >
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            )}

            {/* Desktop menu */}
            {!isMobile && (
                <>
                    {[ 
                        { label: 'Instigate', path: '/instigate' },
                        { label: 'Debate', path: '/debate' },
                        { label: 'Deliberate', path: '/deliberate' },
                        { label: 'Leaderboard', path: '/leaderboard' }
                    ].map(({ label, path }) => {
                        return (
                            <Link key={label} href={path} passHref>
                                <button
                                    style={{
                                        ...buttonStyle
                                    }}
                                    data-text-color={navTextColor}
                                    data-border-color={defaultBorderColor}
                                    data-hover-border-color={defaultHoverBorderColor}
                                    data-hover-text-color={navTextColor}
                                    data-uses-dynamic-color="true"
                                    onMouseEnter={handleMouseEnter}
                                    onMouseLeave={handleMouseLeave}
                                >
                                    {label}
                                </button>
                            </Link>
                        );
                    })}
                    {!session && (
                        <button
                            style={buttonStyle}
                            onMouseEnter={handleMouseEnter}
                            onMouseLeave={handleMouseLeave}
                            onClick={() => signIn('google')}
                            data-text-color={navTextColor}
                            data-border-color={defaultBorderColor}
                            data-hover-border-color={defaultHoverBorderColor}
                            data-hover-text-color={navTextColor}
                            data-uses-dynamic-color="true"
                        >
                            Sign In
                        </button>
                    )}
                </>
            )}

            {/* Mobile menu */}
            {isMobile && isMobileMenuOpen && (
                <div
                    ref={mobileMenuRef}
                    style={{
                        position: 'fixed',
                        top: '74px',
                        left: 0,
                        right: 0,
                        background: mobileMenuBackground,
                        padding: '20px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '15px',
                        zIndex: 1000
                    }}
                >
                    {[ 
                        { label: 'Instigate', path: '/instigate' },
                        { label: 'Debate', path: '/debate' },
                        { label: 'Deliberate', path: '/deliberate' },
                        { label: 'Leaderboard', path: '/leaderboard' }
                    ].map(({ label, path }) => {
                        return (
                            <Link key={label} href={path} passHref>
                                <button
                                    style={{
                                        ...buttonStyle,
                                        width: '100%',
                                        margin: '5px 0',
                                        padding: '15px 20px',
                                        fontSize: '18px',
                                        backdropFilter: 'none',
                                        color: mobileMenuTextColor,
                                        borderColor: mobileMenuBorderColor
                                    }}
                                    data-text-color={mobileMenuTextColor}
                                    data-border-color={mobileMenuBorderColor}
                                    data-hover-border-color={defaultHoverBorderColor}
                                    data-hover-text-color={mobileMenuTextColor}
                                    data-uses-dynamic-color="true"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    {label}
                                </button>
                            </Link>
                        );
                    })}
                    {!session && (
                        <button
                            style={{
                                ...buttonStyle,
                                width: '100%',
                                margin: '5px 0',
                                padding: '15px 20px',
                                fontSize: '18px',
                                backdropFilter: 'none',
                                color: mobileMenuTextColor,
                                borderColor: mobileMenuBorderColor
                            }}
                            data-text-color={mobileMenuTextColor}
                            data-border-color={mobileMenuBorderColor}
                            data-hover-border-color={defaultHoverBorderColor}
                            data-hover-text-color={mobileMenuTextColor}
                            data-uses-dynamic-color="true"
                            onClick={() => { setIsMobileMenuOpen(false); signIn('google'); }}
                        >
                            Sign In
                        </button>
                    )}
                </div>
            )}
        </nav>
    );
}
