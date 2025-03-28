import Link from 'next/link';
import { useSession, signIn, signOut } from 'next-auth/react';

export default function NavBar() {
    const { data: session, status } = useSession();
    const authenticated = status === 'authenticated';

    // Common button style to match your existing nav buttons
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

    // Hover effects for regular buttons
    const handleMouseEnter = (e) => {
        e.target.style.transform = 'translateY(4px)';
        e.target.style.boxShadow = 'none';
    };
    const handleMouseLeave = (e) => {
        e.target.style.transform = 'translateY(0)';
        e.target.style.boxShadow = '0 4px 0 #0056b3';
    };

    // Hover effects for circular buttons
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
            {/* Home button with just the house icon */}
            <Link href="/" passHref>
                <button
                    style={{
                        ...buttonStyle,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '10px',
                        marginLeft: '0',
                        position: 'absolute',
                        left: '20px',
                        width: '44px',
                        height: '44px',
                        borderRadius: '50%',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                    }}
                    onMouseEnter={handleCircularMouseEnter}
                    onMouseLeave={handleCircularMouseLeave}
                >
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
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                        <polyline points="9 22 9 12 15 12 15 22"></polyline>
                    </svg>
                </button>
            </Link>

            {/* Existing nav links */}
            {[
                { label: 'Instigate', path: '/instigate' },
                { label: 'Debate', path: '/debate' },
                { label: 'Deliberate', path: '/deliberate' },
                { label: 'Leaderboard', path: '/Leaderboard/main' },
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

            {/* Sign In / Sign Out Button with Avatar */}
            <button
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
                onClick={() => authenticated ? signOut() : signIn()}
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
        </nav>
    );
}
