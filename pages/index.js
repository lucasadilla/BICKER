import { useRouter } from 'next/router';
import { useState, useEffect, useLayoutEffect } from 'react';
import dbConnect from '../lib/dbConnect';
import Banner from '../models/Banner';
import { useColorScheme } from '../lib/ColorSchemeContext';
import { getSplitTheme } from '../lib/splitTheme';

export default function Home({ bannerUrl }) {
    const router = useRouter();
    const [isMobile, setIsMobile] = useState(false);
    const [hoveredSide, setHoveredSide] = useState(null);
    const { colorScheme: activeScheme } = useColorScheme() || { colorScheme: 'light' };
    const theme = getSplitTheme(activeScheme);
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

    const leftSideColor = hoveredSide === 'left' ? theme.left.hover : theme.left.base;
    const rightSideColor = hoveredSide === 'right' ? theme.right.hover : theme.right.base;
    const splitGradient = `linear-gradient(to right, ${leftSideColor} 0%, ${leftSideColor} 50%, ${rightSideColor} 50%, ${rightSideColor} 100%)`;
    const navGradient =
        activeScheme === 'monochrome'
            ? `linear-gradient(to right, ${theme.left.base} 0%, ${theme.left.base} 100%)`
            : splitGradient;

    useIsomorphicLayoutEffect(() => {
        if (typeof document !== 'undefined') {
            document.documentElement.style.setProperty('--nav-gradient', navGradient);
            document.documentElement.style.setProperty('--nav-button-color', theme.nav.text);
            document.documentElement.style.setProperty('--nav-button-color-hover', theme.nav.text);
            document.documentElement.style.setProperty('--nav-button-border', theme.nav.border);
            document.documentElement.style.setProperty('--nav-button-border-hover', theme.nav.borderHover);
        }
    }, [navGradient, theme.nav.border, theme.nav.borderHover, theme.nav.text]);

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
                        color: theme.left.text,
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
                            color: theme.left.text,
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
                        color: theme.right.text,
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
                            color: theme.right.text,
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
