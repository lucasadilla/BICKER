import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import dbConnect from '../lib/dbConnect';
import Banner from '../models/Banner';

export default function Home({ bannerUrl }) {
    const router = useRouter();
    const [isMobile, setIsMobile] = useState(false);
    const [hoveredSide, setHoveredSide] = useState(null);

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
                paddingTop: '74px',
                boxSizing: 'border-box',
                background:
                    hoveredSide === 'left'
                        ? 'linear-gradient(to right, #FF6A6A 50%, #4D94FF 50%)'
                        : hoveredSide === 'right'
                        ? 'linear-gradient(to right, #FF4D4D 50%, #76ACFF 50%)'
                        : 'linear-gradient(to right, #FF4D4D 50%, #4D94FF 50%)',
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
                        backgroundColor:
                            hoveredSide === 'left' ? '#FF6A6A' : '#FF4D4D',
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
                        backgroundColor:
                            hoveredSide === 'right' ? '#76ACFF' : '#4D94FF',
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
