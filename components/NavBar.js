import Link from 'next/link';

export default function NavBar() {
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
                            boxShadow: '10px 12px rgba(25,25,25,0.58)', // Default shadow
                            transition: 'transform 0.2s ease, box-shadow 0.4s ease', // Smooth animation
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.boxShadow = 'none'; // Remove shadow on hover
                            e.target.style.transform = 'translateY(2px)'; // Simulate "pressing" the button
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.boxShadow = '10px 12px rgba(25,25,25,0.58)'; // Restore shadow
                            e.target.style.transform = 'translateY(0)';
                        }}
                    >
                        {label}
                    </button>
                </Link>
            ))}
        </nav>
    );
}
