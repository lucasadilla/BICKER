import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { signIn, signOut, useSession } from 'next-auth/react';
import Avatar from './Avatar';
import { useColorScheme } from '../lib/ColorSchemeContext';

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
            fetch('/api/notifications')
                .then(res => res.json())
                .then(data => {
                    setNotifications(data.notifications);
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
    const isTargetDarkPage = isDarkMode && ['/', '/debate', '/deliberate'].includes(router.pathname);
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

    return (
        <nav
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
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: isMobile ? '15px' : '10px',
                            width: isMobile ? '54px' : '44px',
                            height: isMobile ? '54px' : '44px',
                            borderRadius: '50%',
                            backgroundColor: 'transparent',
                            borderColor: isTargetDarkPage ? '#000000' : 'var(--nav-button-border, rgba(31, 31, 31, 0.4))',
                            color: isTargetDarkPage ? '#000000' : navTextColor
                        }}
                        onMouseEnter={handleCircularMouseEnter}
                        onMouseLeave={handleCircularMouseLeave}
                        data-border-color={isTargetDarkPage ? '#000000' : 'var(--nav-button-border, rgba(31, 31, 31, 0.4))'}
                        data-hover-border-color={isTargetDarkPage ? '#000000' : undefined}
                        data-text-color={isTargetDarkPage ? '#000000' : navTextColor}
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
                                    top: '5px',
                                    right: '5px',
                                    backgroundColor: 'red',
                                    color: 'white',
                                    borderRadius: '50%',
                                    padding: '2px 6px',
                                    fontSize: '12px'
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
                                notifications.map((n) => (
                                    <div
                                        key={n._id}
                                        style={{
                                            borderBottom: '1px solid #eee',
                                            padding: '5px 0',
                                            color: '#000000'
                                        }}
                                    >
                                        {n.message}
                                    </div>
                                ))
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
                        const shouldUseDarkDesktop = isTargetDarkPage && (label === 'Deliberate' || label === 'Leaderboard');
                        const desktopTextColor = shouldUseDarkDesktop ? '#000000' : buttonStyle.color;
                        const desktopBorderColor = shouldUseDarkDesktop ? '#000000' : buttonStyle.borderColor;
                        return (
                            <Link key={label} href={path} passHref>
                                <button
                                    style={{
                                        ...buttonStyle,
                                        color: desktopTextColor,
                                        borderColor: desktopBorderColor
                                    }}
                                    data-text-color={desktopTextColor}
                                    data-border-color={desktopBorderColor}
                                    data-hover-border-color={shouldUseDarkDesktop ? '#000000' : undefined}
                                    data-hover-text-color={shouldUseDarkDesktop ? '#000000' : undefined}
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
                        background: isTargetDarkPage ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.8)',
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
                        const mobileTextColor = isTargetDarkPage ? '#000000' : navTextColor;
                        const mobileBorderColor = isTargetDarkPage ? '#000000' : 'rgba(255, 255, 255, 0.7)';
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
                                        color: mobileTextColor,
                                        borderColor: mobileBorderColor
                                    }}
                                    data-text-color={mobileTextColor}
                                    data-border-color={mobileBorderColor}
                                    data-hover-border-color={isTargetDarkPage ? '#000000' : undefined}
                                    data-hover-text-color={isTargetDarkPage ? '#000000' : undefined}
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
                                color: isTargetDarkPage ? '#000000' : navTextColor,
                                borderColor: isTargetDarkPage ? '#000000' : 'rgba(255, 255, 255, 0.7)'
                            }}
                            data-text-color={isTargetDarkPage ? '#000000' : navTextColor}
                            data-border-color={isTargetDarkPage ? '#000000' : 'rgba(255, 255, 255, 0.7)'}
                            data-hover-border-color={isTargetDarkPage ? '#000000' : undefined}
                            data-hover-text-color={isTargetDarkPage ? '#000000' : undefined}
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
