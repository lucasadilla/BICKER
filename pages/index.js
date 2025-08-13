import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';

export default function Home() {
    const router = useRouter();
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Whether user is signed in or not, we show the main content
    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                height: '100vh',
                overflow: 'hidden',
            }}
        >
            {/* Split Screen */}
            <div
                style={{
                    display: 'flex',
                    height: '100%',
                    flexDirection: isMobile ? 'column' : 'row',
                }}
            >
                {/* Left Side - Instigate */}
                <div
                    onClick={() => router.push('/instigate')}
                    style={{
                        flex: 1,
                        backgroundColor: '#FF4D4D',
                        color: 'white',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        cursor: 'pointer',
                        transition: 'background-color 0.3s ease',
                        width: isMobile ? '100%' : '50%',
                        height: isMobile ? '50%' : '100%',
                    }}
                    onMouseEnter={(e) => (e.target.style.backgroundColor = '#FF6A6A')}
                    onMouseLeave={(e) => (e.target.style.backgroundColor = '#FF4D4D')}
                >
                    <h1
                        className="heading-1"
                        style={{
                            fontSize: isMobile ? '28px' : '36px',
                            textAlign: 'center',
                            margin: '0 20px',
                        }}
                    >
                        Instigate
                        <br />
                        Click to Begin
                    </h1>
                </div>

                {/* Right Side - Debate */}
                <div
                    onClick={() => router.push('/debate')}
                    style={{
                        flex: 1,
                        backgroundColor: '#4D94FF',
                        color: 'white',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        cursor: 'pointer',
                        transition: 'background-color 0.3s ease',
                        width: isMobile ? '100%' : '50%',
                        height: isMobile ? '50%' : '100%',
                    }}
                    onMouseEnter={(e) => (e.target.style.backgroundColor = '#76ACFF')}
                    onMouseLeave={(e) => (e.target.style.backgroundColor = '#4D94FF')}
                >
                    <h1
                        className="heading-1"
                        style={{
                            fontSize: isMobile ? '28px' : '36px',
                            textAlign: 'center',
                            margin: '0 20px',
                        }}
                    >
                        Debate
                        <br />
                        Click to Join
                    </h1>
                </div>
            </div>
        </div>
    );
}
