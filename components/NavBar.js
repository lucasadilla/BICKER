import Link from 'next/link';

export default function NavBar() {
    return (
        <nav
            style={{
                position: 'absolute', // Overlay on top of the page
                top: 0,
                left: 0,
                width: '100%',
                backgroundColor: 'rgba(0,0,0,0)', // Slight transparency
                zIndex: 10, // Ensure it stays above other content
                padding: '10px',
                display: 'flex',
                justifyContent: 'center',
                gap: '300px',
            }}
        >
            <Link href="/" passHref>
                <button
                    style={{
                        backgroundColor: '#ebc7fa',
                        color: 'black',
                        border: 'none',
                        padding: '10px 20px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '16px',
                    }}
                >
                    Home
                </button>
            </Link>
            <Link href="/instigate" passHref>
                <button
                    style={{
                        backgroundColor: '#ebc7fa',
                        color: 'black',
                        border: 'none',
                        padding: '10px 20px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '16px',
                    }}
                >
                    Instigate
                </button>
            </Link>
            <Link href="/debate" passHref>
                <button
                    style={{
                        backgroundColor: '#ebc7fa',
                        color: 'black',
                        border: 'none',
                        padding: '10px 20px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '16px',
                    }}
                >
                    Debate
                </button>
            </Link>
            <Link href="/deliberate" passHref>
                <button
                    style={{
                        backgroundColor: '#ebc7fa',
                        color: 'black',
                        border: 'none',
                        padding: '10px 20px',
                        borderRadius: '4px',
                        borderColor: 'white',
                        cursor: 'pointer',
                        fontSize: '16px',
                    }}
                >
                    Deliberate
                </button>
            </Link>
        </nav>
    );
}
