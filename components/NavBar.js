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
        boxShadow: '10px 12px rgba(25,25,25,0.58)',
        transition: 'transform 0.2s ease, box-shadow 0.4s ease',
        marginLeft: '20px', // space between last nav link and sign in/out
    };

    // Hover effects for the sign in/out button
    const handleMouseEnter = (e) => {
        e.target.style.boxShadow = 'none';
        e.target.style.transform = 'translateY(2px)';
    };
    const handleMouseLeave = (e) => {
        e.target.style.boxShadow = '10px 12px rgba(25,25,25,0.58)';
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
            {/* Existing nav links */}
            {[
                { label: 'Home', path: '/' },
                { label: 'Instigate', path: '/instigate' },
                { label: 'Debate', path: '/debate' },
                { label: 'Deliberate', path: '/deliberate' },
            ].map(({ label, path }) => (
                <Link key={label} href={path} passHref>
                    <button
                        style={{
                            padding: '10px 20px',
                            fontSize: '16px',
                            fontWeight: 'bold',
                            border: 'none',
                            borderRadius: '5px',
                            backgroundColor: '#007BFF',
                            color: 'white',
                            cursor: 'pointer',
                            boxShadow: '10px 12px rgba(25,25,25,0.58)',
                            transition: 'transform 0.2s ease, box-shadow 0.4s ease',
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.boxShadow = 'none';
                            e.target.style.transform = 'translateY(2px)';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.boxShadow = '10px 12px rgba(25,25,25,0.58)';
                            e.target.style.transform = 'translateY(0)';
                        }}
                    >
                        {label}
                    </button>
                </Link>
            ))}

            {/* Sign In / Sign Out Button */}
            {authenticated ? (
                <button
                    style={buttonStyle}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                    onClick={() => signOut()}
                >
                    Sign Out
                </button>
            ) : (
                <button
                    style={buttonStyle}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                    onClick={() => signIn()} // Will open NextAuth's sign-in flow
                >
                    Sign In
                </button>
            )}
        </nav>
    );
}
