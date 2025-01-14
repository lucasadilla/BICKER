import Link from 'next/link';

export default function NavBar() {
    return (
        <nav
            style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '20px',
                padding: '10px 0', // Consistent padding
                backgroundColor: 'transparent', // Transparent background
                position: 'fixed',
                top: 0,
                width: '100%',
                zIndex: 1000,
                boxShadow: 'none', // Remove shadows
                border: 'none', // Ensure no borders
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
                            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.boxShadow = '0 6px 10px rgba(0, 0, 0, 0.2)';
                            e.target.style.transform = 'translateY(-2px)';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
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
