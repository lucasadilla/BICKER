// pages/deliberate/index.js
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react'; // <-- IMPORTANT
import NavBar from '../components/NavBar'; // If you have a NavBar; otherwise remove

// Helper function to shuffle array
const shuffleArray = (array) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
};

export default function DeliberatePage({ initialDebates }) {
    const [debates, setDebates] = useState(initialDebates || []);
    const [currentDebateIndex, setCurrentDebateIndex] = useState(0);
    const [showVotes, setShowVotes] = useState(false);
    const [hoveringSide, setHoveringSide] = useState('');

    // Check if user is signed in or not
    const { data: session, status } = useSession();

    // If there were no initialDebates, fetch them client-side
    useEffect(() => {
        if (!initialDebates || initialDebates.length === 0) {
            fetchDebates();
        }
    }, [initialDebates]);

    // After voting, show results for 4 seconds before moving on
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
            if (!response.ok) throw new Error('HTTP error! ' + response.status);
            const data = await response.json();
            // Shuffle the debates before setting them
            setDebates(shuffleArray(data));
        } catch (error) {
            console.error('Error fetching debates:', error);
        }
    };

    const handleVote = async (side) => {
        try {
            const body = side === 'red' ? {
                debateId: currentDebate._id,
                votesRed: 1
            } : {
                debateId: currentDebate._id,
                votesBlue: 1
            };

            const response = await fetch('/api/deliberate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            // Update local state with new vote counts
            setDebates(prevDebates => 
                prevDebates.map(debate => 
                    debate._id === currentDebate._id
                        ? {
                            ...debate,
                            votesRed: data.votesRed,
                            votesBlue: data.votesBlue
                        }
                        : debate
                )
            );

            // Show the vote results
            setShowVotes(true);
        } catch (error) {
            console.error('Error voting:', error);
            alert('Failed to vote. Please try again.');
        }
    };

    const nextDebate = () => {
        setShowVotes(false);
        setCurrentDebateIndex((prevIndex) => (prevIndex + 1) % debates.length);
    };

    const currentDebate = debates[currentDebateIndex];

    // If no debates available, show fallback
    if (!currentDebate) {
        return (
            <div style={{ textAlign: 'center', marginTop: '50px' }}>
                <h2>No debates available</h2>
            </div>
        );
    }

    // Calculate percentages for dynamic width
    const totalVotes = (currentDebate.votesRed || 0) + (currentDebate.votesBlue || 0);
    let redPercent = 50;
    let bluePercent = 50;

    if (totalVotes > 0) {
        redPercent = ((currentDebate.votesRed || 0) / totalVotes) * 100;
        bluePercent = 100 - redPercent;
    }
    const redWidth = showVotes ? `${redPercent}%` : '50%';
    const blueWidth = showVotes ? `${bluePercent}%` : '50%';

    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                height: '100vh',
                overflow: 'hidden',
            }}
        >
            <NavBar /> {/* remove if you don't have a NavBar */}

            {/* Fullscreen Debate Section */}
            <div style={{ display: 'flex', height: '100%', width: '100%' }}>
                {/* Left side: Red */}
                <div
                    // If showVotes or no session, we won't let them click to vote
                    onClick={() => (!showVotes ? handleVote('red') : null)}
                    onMouseEnter={() => setHoveringSide('red')}
                    onMouseLeave={() => setHoveringSide('')}
                    style={{
                        width: redWidth,
                        backgroundColor: hoveringSide === 'red' ? '#FF6A6A' : '#FF4D4D',
                        color: 'white',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        cursor: showVotes ? 'default' : 'pointer',
                        transition: 'width 1s ease, background-color 0.3s ease',
                    }}
                    title={!session ? 'Sign in to vote on this side' : ''}
                >
                    <p
                        style={{
                            fontWeight: 'bold',
                            fontSize: '24px',
                            textAlign: 'center',
                            margin: 0,
                            whiteSpace: 'normal',
                            wordBreak: 'break-word',
                            overflowWrap: 'break-word',
                            maxWidth: '40%',
                            padding: '0 10px',
                        }}
                    >
                        {currentDebate.instigateText || 'Unknown Instigate'}
                    </p>
                    {showVotes && (
                        <p style={{ fontSize: '18px', marginTop: '20px' }}>
                            Votes: {currentDebate.votesRed || 0}
                        </p>
                    )}
                </div>

                {/* Right side: Blue */}
                <div
                    onClick={() => (!showVotes ? handleVote('blue') : null)}
                    onMouseEnter={() => setHoveringSide('blue')}
                    onMouseLeave={() => setHoveringSide('')}
                    style={{
                        width: blueWidth,
                        backgroundColor: hoveringSide === 'blue' ? '#76ACFF' : '#4D94FF',
                        color: 'white',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        cursor: showVotes ? 'default' : 'pointer',
                        transition: 'width 1s ease, background-color 0.3s ease',
                    }}
                    title={!session ? 'Sign in to vote on this side' : ''}
                >
                    <p
                        style={{
                            fontWeight: 'bold',
                            fontSize: '24px',
                            textAlign: 'center',
                            margin: 0,
                            whiteSpace: 'normal',
                            wordBreak: 'break-word',
                            overflowWrap: 'break-word',
                            maxWidth: '40%',
                            padding: '0 10px',
                        }}
                    >
                        {currentDebate.debateText || 'Unknown Debate'}
                    </p>
                    {showVotes && (
                        <p style={{ fontSize: '18px', marginTop: '20px' }}>
                            Votes: {currentDebate.votesBlue || 0}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}

// Server-side props with randomized debates
export async function getServerSideProps() {
    const res = await fetch('http://localhost:3000/api/deliberate');
    let initialDebates = [];
    try {
        initialDebates = await res.json();
        // Shuffle the debates on the server side
        for (let i = initialDebates.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [initialDebates[i], initialDebates[j]] = [initialDebates[j], initialDebates[i]];
        }
    } catch (error) {
        console.error('Error parsing JSON:', error);
    }

    return {
        props: { initialDebates },
    };
}
