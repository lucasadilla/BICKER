import { useRouter } from 'next/router';
import { useState, useEffect, useLayoutEffect } from 'react';
import dbConnect from '../lib/dbConnect';
import Banner from '../models/Banner';
import { useColorScheme } from '../lib/ColorSchemeContext';

export default function Home({ bannerUrl }) {
    const router = useRouter();
    const [isMobile, setIsMobile] = useState(false);
    const [hoveredSide, setHoveredSide] = useState(null);
    const { colorScheme } = useColorScheme();
    const isDarkMode = colorScheme === 'dark';
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

    const baseLeftColor = isDarkMode ? '#000000' : '#FF4D4D';
    const baseRightColor = isDarkMode ? '#FFFFFF' : '#4D94FF';
    const leftSideColor =
        hoveredSide === 'left'
            ? isDarkMode
                ? '#111111'
                : '#FF6A6A'
            : baseLeftColor;
    const rightSideColor =
        hoveredSide === 'right'
            ? isDarkMode
                ? '#E5E5E5'
                : '#76ACFF'
            : baseRightColor;
    const leftTextColor = '#ffffff';
    const rightTextColor = isDarkMode ? '#000000' : '#ffffff';
    const splitGradient = `linear-gradient(to right, ${baseLeftColor} 0%, ${baseLeftColor} 50%, ${baseRightColor} 50%, ${baseRightColor} 100%)`;

    useIsomorphicLayoutEffect(() => {
        const gradient = splitGradient;
        if (typeof document !== 'undefined') {
            document.documentElement.style.setProperty('--nav-gradient', gradient);
            document.documentElement.style.setProperty(
                '--nav-button-color',
                isDarkMode ? '#f5f5f5' : '#ffffff'
            );
            document.documentElement.style.setProperty(
                '--nav-button-color-hover',
                '#ffffff'
            );
            document.documentElement.style.setProperty(
                '--nav-button-border',
                isDarkMode ? 'rgba(245, 245, 245, 0.7)' : 'rgba(255, 255, 255, 0.7)'
            );
            document.documentElement.style.setProperty(
                '--nav-button-border-hover',
                isDarkMode ? '#ffffff' : 'rgba(255, 255, 255, 0.9)'
            );
            document.documentElement.style.setProperty(
                '--nav-button-text',
                isDarkMode ? '#f5f5f5' : '#ffffff'
            );
        }
    }, [splitGradient, isDarkMode]);

    useIsomorphicLayoutEffect(() => {
        return () => {
            if (typeof document !== 'undefined') {
                document.documentElement.style.removeProperty('--nav-gradient');
                document.documentElement.style.removeProperty('--nav-button-color');
                document.documentElement.style.removeProperty('--nav-button-color-hover');
                document.documentElement.style.removeProperty('--nav-button-border');
                document.documentElement.style.removeProperty('--nav-button-border-hover');
                document.documentElement.style.removeProperty('--nav-button-text');
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
                boxSizing: 'border-box',
                transition: 'background 0.3s ease',
                background: splitGradient,
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
                        background: leftSideColor,
                        color: leftTextColor,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        cursor: 'pointer',
                        transition: 'background 0.3s ease',
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
                        background: rightSideColor,
                        color: rightTextColor,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        cursor: 'pointer',
                        transition: 'background 0.3s ease',
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
