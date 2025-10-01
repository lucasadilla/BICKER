import { useRouter } from 'next/router';
import { useState, useEffect, useLayoutEffect } from 'react';
import dbConnect from '../lib/dbConnect';
import Banner from '../models/Banner';

export default function Home({ bannerUrl }) {
    const router = useRouter();
    const [isMobile, setIsMobile] = useState(false);
    const [hoveredSide, setHoveredSide] = useState(null);
    const useIsomorphicLayoutEffect =
        typeof window !== 'undefined' ? useLayoutEffect : useEffect;

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const leftSideColor = hoveredSide === 'left' ? '#FF6A6A' : '#FF4D4D';
    const rightSideColor = hoveredSide === 'right' ? '#76ACFF' : '#4D94FF';

    useIsomorphicLayoutEffect(() => {
        const gradient = `linear-gradient(to right, ${leftSideColor} 50%, ${rightSideColor} 50%)`;
        if (typeof document !== 'undefined') {
            document.documentElement.style.setProperty('--nav-gradient', gradient);
            document.documentElement.style.setProperty('--nav-button-color', '#ffffff');
            document.documentElement.style.setProperty('--nav-button-color-hover', '#ffffff');
            document.documentElement.style.setProperty('--nav-button-border', 'rgba(255, 255, 255, 0.7)');
            document.documentElement.style.setProperty('--nav-button-border-hover', 'rgba(255, 255, 255, 0.9)');
        }
    }, [leftSideColor, rightSideColor]);

    useIsomorphicLayoutEffect(() => {
        return () => {
            if (typeof document !== 'undefined') {
                document.documentElement.style.removeProperty('--nav-gradient');
                document.documentElement.style.removeProperty('--nav-button-color');
                document.documentElement.style.removeProperty('--nav-button-color-hover');
                document.documentElement.style.removeProperty('--nav-button-border');
                document.documentElement.style.removeProperty('--nav-button-border-hover');
            }
        };
    }, []);

    // Whether user is signed in or not, we show the main content
    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                height: '100vh',
                paddingTop: '74px',
                boxSizing: 'border-box',
                transition: 'background 0.3s ease',
                background: `linear-gradient(to right, ${leftSideColor} 50%, ${rightSideColor} 50%)`,
            }}
        >
            {bannerUrl && (
                <img
                    src={bannerUrl}
                    alt="Banner"
                    style={{ width: '100%', height: 'auto', flexShrink: 0 }}
                />
            )}
            {/* Split Screen */}
            <div
                style={{
                    display: 'flex',
                    flex: 1,
                    flexDirection: isMobile ? 'column' : 'row',
                }}
            >
                {/* Left Side - Instigate */}
                <div
                    onClick={() => router.push('/instigate')}
                    style={{
                        flex: 1,
                        backgroundColor: leftSideColor,
                        color: 'white',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        cursor: 'pointer',
                        transition: 'background-color 0.3s ease',
                        width: isMobile ? '100%' : '50%',
                        height: isMobile ? '50%' : '100%',
                    }}
                    onMouseEnter={() => setHoveredSide('left')}
                    onMouseLeave={() => setHoveredSide(null)}
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
                        backgroundColor: rightSideColor,
                        color: 'white',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        cursor: 'pointer',
                        transition: 'background-color 0.3s ease',
                        width: isMobile ? '100%' : '50%',
                        height: isMobile ? '50%' : '100%',
                    }}
                    onMouseEnter={() => setHoveredSide('right')}
                    onMouseLeave={() => setHoveredSide(null)}
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

export async function getServerSideProps() {
    let bannerUrl = '';
    if (process.env.MONGO_URI) {
        try {
            await dbConnect();
            const banner = await Banner.findOne({}).lean();
            bannerUrl = banner ? banner.imageUrl : '';
        } catch (err) {
            console.error('Failed to load banner:', err);
        }
    }
    return {
        props: { bannerUrl },
    };
}
