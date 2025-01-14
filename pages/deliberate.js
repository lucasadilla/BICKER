import { useState, useEffect } from 'react';
import NavBar from '../components/NavBar';

export default function DeliberatePage({ initialDebates }) {
    const [debates, setDebates] = useState(initialDebates || []);
    const [currentDebateIndex, setCurrentDebateIndex] = useState(0);
    const [showVotes, setShowVotes] = useState(false);
    const [hoveringSide, setHoveringSide] = useState(''); // Track which side is hovered

    useEffect(() => {
        if (!initialDebates || initialDebates.length === 0) {
            fetchDebates();
        }
    }, []);

    useEffect(() => {
        if (showVotes) {
            const timer = setTimeout(() => {
                nextDebate();
            }, 4000);
            return () => clearTimeout(timer);
        }
    }, [showVotes]);

    const fetchDebates = async () => {
        try {
            const response = await fetch('/api/deliberate');
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            setDebates(data);
        } catch (error) {
            console.error('Error fetching debates:', error);
        }
    };

    const vote = async (debateId, side) => {
        try {
            const votes = side === 'red' ? { votesRed: 1 } : { votesBlue: 1 };

            await fetch('/api/deliberate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ debateId, ...votes }),
            });

            setShowVotes(true);
        } catch (error) {
            console.error('Error submitting vote:', error);
            alert('Failed to submit vote. Please try again.');
        }
    };

    const nextDebate = () => {
        setShowVotes(false);
        setCurrentDebateIndex((prevIndex) => (prevIndex + 1) % debates.length);
    };

    const currentDebate = debates[currentDebateIndex];

    if (!currentDebate) {
        // If there are no debates, return an empty fragment
        return null;
    }

    return (
        <div
            style={{
                fontFamily: 'Arial, sans-serif',
                display: 'flex',
                flexDirection: 'column',
                height: '100vh',
                position: 'relative',
                overflow: 'hidden',
            }}
        >
            {/* NavBar */}
            <NavBar />

            {/* Fullscreen Debate Section */}
            <div style={{ display: 'flex', height: '100%', width: '100%' }}>
                {/* Left Side - Red */}
                <div
                    onClick={() => !showVotes && vote(currentDebate._id, 'red')}
                    onMouseEnter={() => setHoveringSide('red')}
                    onMouseLeave={() => setHoveringSide('')}
                    style={{
                        flex: 1,
                        backgroundColor: hoveringSide === 'red' ? '#FF6A6A' : '#FF4D4D',
                        color: 'white',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        cursor: showVotes ? 'default' : 'pointer',
                        height: '100%',
                        transition: 'background-color 0.3s ease',
                    }}
                >
                    <p style={{ fontWeight: 'bold', fontSize: '24px', textAlign: 'center', margin: 0 }}>
                        {currentDebate.instigateId?.text || 'Unknown Instigate'}
                    </p>
                    {showVotes && <p style={{ fontSize: '18px', marginTop: '20px' }}>Votes: {currentDebate.votesRed || 0}</p>}
                </div>

                {/* Right Side - Blue */}
                <div
                    onClick={() => !showVotes && vote(currentDebate._id, 'blue')}
                    onMouseEnter={() => setHoveringSide('blue')}
                    onMouseLeave={() => setHoveringSide('')}
                    style={{
                        flex: 1,
                        backgroundColor: hoveringSide === 'blue' ? '#76ACFF' : '#4D94FF',
                        color: 'white',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        cursor: showVotes ? 'default' : 'pointer',
                        height: '100%',
                        transition: 'background-color 0.3s ease',
                    }}
                >
                    <p style={{ fontWeight: 'bold', fontSize: '24px', textAlign: 'center', margin: 0 }}>
                        {currentDebate.debateText || 'Unknown Debate'}
                    </p>
                    {showVotes && <p style={{ fontSize: '18px', marginTop: '20px' }}>Votes: {currentDebate.votesBlue || 0}</p>}
                </div>
            </div>
        </div>
    );
}

// Prefetch debates at build time
export async function getStaticProps() {
    try {
        const response = await fetch('http://localhost:3000/api/deliberate'); // Replace with your API URL
        const initialDebates = await response.json();
        return { props: { initialDebates } };
    } catch (error) {
        console.error('Error prefetching debates:', error);
        return { props: { initialDebates: [] } };
    }
}
