import { useState, useEffect } from 'react';
import NavBar from '../components/NavBar';

export default function Leaderboard() {
    const [stats, setStats] = useState({
        totalVotes: 0,
        redVotes: 0,
        blueVotes: 0,
        redPercentage: 0,
        bluePercentage: 0
    });

    // Added mobile state detection
    const [isMobile, setIsMobile] = useState(false);

    const [latestDebate, setLatestDebate] = useState(null);

    // Fetch stats and set mobile detection on mount
    useEffect(() => {
        fetchStats();
        fetchLatestDebate();

        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };

        // Initial check & add event listener
        if (typeof window !== 'undefined') {
            handleResize();
            window.addEventListener('resize', handleResize);
        }
        return () => {
            if (typeof window !== 'undefined') {
                window.removeEventListener('resize', handleResize);
            }
        };
    }, []);

    const fetchStats = async () => {
        try {
            const response = await fetch('/api/deliberate');
            if (!response.ok) {
                throw new Error('Failed to fetch stats');
            }
            const deliberations = await response.json();

            // Calculate total votes, red votes, and blue votes
            const totalVotes = deliberations.reduce(
                (sum, d) => sum + (d.votesRed || 0) + (d.votesBlue || 0),
                0
            );
            const redVotes = deliberations.reduce(
                (sum, d) => sum + (d.votesRed || 0),
                0
            );
            const blueVotes = deliberations.reduce(
                (sum, d) => sum + (d.votesBlue || 0),
                0
            );

            setStats({
                totalVotes,
                redVotes,
                blueVotes,
                redPercentage: totalVotes > 0 ? (redVotes / totalVotes * 100).toFixed(1) : 0,
                bluePercentage: totalVotes > 0 ? (blueVotes / totalVotes * 100).toFixed(1) : 0
            });
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    async function fetchLatestDebate() {
        try {
            const response = await fetch('/api/debate');
            if (!response.ok) {
                throw new Error('Failed to fetch latest debate');
            }
            const debates = await response.json();
            if (debates && debates.length > 0) {
                setLatestDebate(debates[0]);
            }
        } catch (error) {
            console.error('Error fetching latest debate:', error);
        }
    }

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
            <NavBar />
            <div
                style={{
                    maxWidth: '800px',
                    margin: '0 auto',
                    padding: '20px',
                    minHeight: 'calc(100vh - 60px)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                <h1
                    style={{
                        textAlign: 'center',
                        marginBottom: '30px',
                        color: '#333'
                    }}
                >
                    Global Voting Statistics
                </h1>

                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '20px',
                        width: '100%',
                        maxWidth: '600px',
                        padding: isMobile ? '0 10px' : '0'
                    }}
                >
                    <div
                        style={{
                            backgroundColor: 'white',
                            padding: '20px',
                            borderRadius: '10px',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                            textAlign: 'center',
                            width: '100%'
                        }}
                    >
                        <h2 style={{ marginBottom: '10px', color: '#333' }}>Total Votes</h2>
                        <p
                            style={{
                                fontSize: '24px',
                                fontWeight: 'bold',
                                color: '#4D94FF'
                            }}
                        >
                            {stats.totalVotes}
                        </p>
                    </div>

                    <div
                        style={{
                            width: '100%',
                            height: '60px',
                            display: 'flex',
                            borderRadius: '10px',
                            overflow: 'hidden',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                        }}
                    >
                        <div
                            style={{
                                width: `${stats.redPercentage}%`,
                                backgroundColor: '#FF4D4D',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                alignItems: 'center',
                                color: 'white',
                                transition: 'width 0.5s ease'
                            }}
                        >
                            <p style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>
                                {stats.redVotes}
                            </p>
                            <p style={{ margin: 0, fontSize: '14px', opacity: 0.9 }}>
                                {stats.redPercentage}%
                            </p>
                        </div>
                        <div
                            style={{
                                width: `${stats.bluePercentage}%`,
                                backgroundColor: '#4D94FF',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                alignItems: 'center',
                                color: 'white',
                                transition: 'width 0.5s ease'
                            }}
                        >
                            <p style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>
                                {stats.blueVotes}
                            </p>
                            <p style={{ margin: 0, fontSize: '14px', opacity: 0.9 }}>
                                {stats.bluePercentage}%
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Debate Text Display */}
            <div
                style={{
                    width: '100%',
                    maxWidth: '800px',
                    margin: '20px auto',
                    padding: isMobile ? '0 10px' : '20px',
                    backgroundColor: '#f5f5f5',
                    borderRadius: '12px',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                }}
            >
                <h2
                    style={{
                        textAlign: 'center',
                        marginBottom: '20px',
                        color: '#333'
                    }}
                >
                    Latest Debate
                </h2>
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px',
                        padding: '0 10px'
                    }}
                >
                    {/* Instigate Text (Red) */}
                    <div
                        style={{
                            alignSelf: 'flex-start',
                            maxWidth: isMobile ? '80%' : '60%',
                            backgroundColor: '#FF4D4D',
                            color: 'white',
                            padding: '12px 16px',
                            borderRadius: '16px',
                            borderTopLeftRadius: '4px',
                            marginLeft: '0',
                            position: 'relative',
                            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
                        }}
                    >
                        <p
                            style={{
                                margin: 0,
                                fontSize: isMobile ? '16px' : '18px',
                                lineHeight: '1.4'
                            }}
                        >
                            {latestDebate?.instigateText || 'No debate available'}
                        </p>
                    </div>

                    {/* Debate Text (Blue) */}
                    <div
                        style={{
                            alignSelf: 'flex-end',
                            maxWidth: isMobile ? '80%' : '60%',
                            backgroundColor: '#4D94FF',
                            color: 'white',
                            padding: '12px 16px',
                            borderRadius: '16px',
                            borderTopRightRadius: '4px',
                            marginRight: '0',
                            position: 'relative',
                            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
                        }}
                    >
                        <p
                            style={{
                                margin: 0,
                                fontSize: isMobile ? '16px' : '18px',
                                lineHeight: '1.4'
                            }}
                        >
                            {latestDebate?.debateText || 'No response available'}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
