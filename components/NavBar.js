import Link from 'next/link';
import { useSession, signIn, signOut } from 'next-auth/react';
import { useState, useEffect } from 'react';

export default function NavBar() {
    const { data: session, status } = useSession();
    const authenticated = status === 'authenticated';
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        
        checkMobile();
        window.addEventListener('resize', checkMobile);
        
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

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
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                        backgroundColor: isMobile ? '#28a745' : '#007BFF',
                        boxShadow: isMobile ? '0 4px 0 #1e7e34' : '0 2px 4px rgba(0,0,0,0.2)'
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

            {/* Mobile menu button */}
            {isMobile && (
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    style={{
                        ...buttonStyle,
                        padding: '15px',
                        width: '54px',
                        height: '54px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'absolute',
                        right: '20px',
                        backgroundColor: '#6c757d',
                        boxShadow: '0 4px 0 #545b62'
                    }}
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="28"
                        height="28"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <line x1="3" y1="12" x2="21" y2="12"></line>
                        <line x1="3" y1="6" x2="21" y2="6"></line>
                        <line x1="3" y1="18" x2="21" y2="18"></line>
                    </svg>
                </button>
            )}

            {/* Desktop menu */}
            {!isMobile && (
                <>
                    {[
                        { label: 'Instigate', path: '/instigate' },
                        { label: 'Debate', path: '/debate' },
                        { label: 'Deliberate', path: '/deliberate' },
                        { label: 'Leaderboard', path: '/Leaderboard/global' },
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
                    <button
                        onClick={() => authenticated ? signOut() : signIn()}
                        style={{
                            ...buttonStyle,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '10px',
                            marginLeft: '0',
                            position: 'absolute',
                            right: '20px',
                            backgroundColor: authenticated ? '#4CAF50' : '#FF4D4D',
                            width: '44px',
                            height: '44px',
                            borderRadius: '50%',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                        }}
                        onMouseEnter={handleCircularMouseEnter}
                        onMouseLeave={handleCircularMouseLeave}
                    >
                        {authenticated ? (
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24" 
                                height="24" 
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                <circle cx="12" cy="7" r="4"></circle>
                            </svg>
                        ) : (
                            <svg 
                                xmlns="http://www.w3.org/2000/svg" 
                                width="24" 
                                height="24" 
                                viewBox="0 0 24 24" 
                                fill="none" 
                                stroke="currentColor" 
                                strokeWidth="2" 
                                strokeLinecap="round" 
                                strokeLinejoin="round"
                            >
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                <circle cx="12" cy="7" r="4"></circle>
                                <line x1="12" y1="11" x2="12" y2="17"></line>
                                <line x1="9" y1="14" x2="15" y2="14"></line>
                            </svg>
                        )}
                    </button>
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
                { label: 'Leaderboard', path: '/Leaderboard/main' },
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
            {authenticated ? (
                <button
                            onClick={() => {
                                signOut();
                                setIsMobileMenuOpen(false);
                            }}
                            style={{
                                ...buttonStyle,
                                width: '100%',
                                margin: '5px 0',
                                padding: '15px 20px',
                                fontSize: '18px',
                                backgroundColor: '#dc3545',
                                boxShadow: '0 4px 0 #bd2130'
                            }}
                >
                    Sign Out
                </button>
            ) : (
                <button
                            onClick={() => {
                                signIn();
                                setIsMobileMenuOpen(false);
                            }}
                            style={{
                                ...buttonStyle,
                                width: '100%',
                                margin: '5px 0',
                                padding: '15px 20px',
                                fontSize: '18px',
                                backgroundColor: '#28a745',
                                boxShadow: '0 4px 0 #1e7e34'
                            }}
                >
                    Sign In
                </button>
                    )}
                </div>
            )}
        </nav>
    );
}
