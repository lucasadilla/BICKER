import Link from 'next/link';
import { useState, useEffect } from 'react';
import { signIn, signOut, useSession } from 'next-auth/react';
import Avatar from './Avatar';

export default function NavBar() {
    const { data: session } = useSession();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [profilePicture, setProfilePicture] = useState('');

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
                .then(data => setNotifications(data))
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
        if (!showNotifications && notifications.length > 0) {
            const ids = notifications.map(n => n._id);
            await fetch('/api/notifications', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids })
            });
            setNotifications([]);
        }
    };

    // Common button style
    const buttonStyle = {
        padding: '10px 20px',
        fontSize: '16px',
        fontWeight: 'bold',
        border: 'none',
        borderRadius: '5px',
        backgroundColor: '#007BFF',
        color: 'white',
        cursor: 'pointer',
        boxShadow: '0 4px 0 #0056b3',
        transition: 'all 0.1s ease',
        marginLeft: '20px',
        position: 'relative',
    };

    // Hover effects
    const handleMouseEnter = (e) => {
        e.target.style.transform = 'translateY(4px)';
        e.target.style.boxShadow = 'none';
    };
    const handleMouseLeave = (e) => {
        e.target.style.transform = 'translateY(0)';
        e.target.style.boxShadow = '0 4px 0 #0056b3';
    };

    const handleCircularMouseEnter = (e) => {
        e.target.style.boxShadow = 'none';
        e.target.style.transform = 'translateY(2px)';
    };
    const handleCircularMouseLeave = (e) => {
        e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
        e.target.style.transform = 'translateY(0)';
    };

    return (
        <nav
            style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '20px',
                padding: '10px 0',
                backgroundColor: 'transparent',
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
                        backgroundColor: '#007BFF',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                    }}
                    onMouseEnter={handleCircularMouseEnter}
                    onMouseLeave={handleCircularMouseLeave}
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
                    style={{
                        position: 'absolute',
                        right: isMobile ? '80px' : '20px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-end'
                    }}
                    onMouseEnter={() => setShowUserMenu(true)}
                    onMouseLeave={() => setShowUserMenu(false)}
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
                            style={{
                                marginTop: '10px',
                                backgroundColor: 'white',
                                padding: '10px 20px',
                                boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                                borderRadius: '8px',
                                minWidth: '160px',
                                zIndex: 1000
                            }}
                        >
                            <Link href="/my-stats" passHref>
                                <div
                                    style={{
                                        padding: '8px 0',
                                        cursor: 'pointer',
                                        whiteSpace: 'nowrap'
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
                                        whiteSpace: 'nowrap'
                                    }}
                                >
                                    Edit Profile
                                </div>
                            </Link>
                            <div
                                style={{ padding: '8px 0', cursor: 'pointer', whiteSpace: 'nowrap' }}
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
                            backgroundColor: '#ffc107',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                        }}
                        onMouseEnter={handleCircularMouseEnter}
                        onMouseLeave={handleCircularMouseLeave}
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
                        {notifications.length > 0 && (
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
                                {notifications.length}
                            </span>
                        )}
                    </button>
                    {showNotifications && (
                        <div
                            style={{
                                position: 'absolute',
                                top: '60px',
                                right: '0',
                                backgroundColor: 'white',
                                padding: '10px',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                width: '250px',
                                zIndex: 1000
                            }}
                        >
                            {notifications.length === 0 ? (
                                <div style={{ padding: '10px' }}>No new notifications</div>
                            ) : (
                                notifications.map((n) => (
                                    <div
                                        key={n._id}
                                        style={{
                                            borderBottom: '1px solid #eee',
                                            padding: '5px 0'
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
                    ].map(({ label, path }) => (
                        <Link key={label} href={path} passHref>
                            <button
                                style={buttonStyle}
                                onMouseEnter={handleMouseEnter}
                                onMouseLeave={handleMouseLeave}
                            >
                                {label}
                            </button>
                        </Link>
                    ))}
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
                    style={{
                        position: 'fixed',
                        top: '74px',
                        left: 0,
                        right: 0,
                        backgroundColor: 'white',
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
            ].map(({ label, path }) => (
                <Link key={label} href={path} passHref>
                    <button
                        style={{
                                    ...buttonStyle,
                                    width: '100%',
                                    margin: '5px 0',
                                    padding: '15px 20px',
                                    fontSize: '18px'
                                }}
                                onClick={() => setIsMobileMenuOpen(false)}
                    >
                        {label}
                    </button>
                </Link>
            ))}
            {!session && (
                <button
                    style={{
                        ...buttonStyle,
                        width: '100%',
                        margin: '5px 0',
                        padding: '15px 20px',
                        fontSize: '18px'
                    }}
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
