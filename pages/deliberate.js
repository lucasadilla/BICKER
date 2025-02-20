// pages/deliberate/index.js

import { useState, useEffect } from 'react';
import NavBar from '../components/NavBar'; // If you have a NavBar; otherwise remove

export default function DeliberatePage({ initialDebates }) {
    const [debates, setDebates] = useState(initialDebates || []);
    const [currentDebateIndex, setCurrentDebateIndex] = useState(0);
    const [showVotes, setShowVotes] = useState(false);
    const [hoveringSide, setHoveringSide] = useState('');

    // If there were no initialDebates, fetch them on client side
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

    // Client-side fetch if needed
    const fetchDebates = async () => {
        try {
            const response = await fetch('/api/deliberate');
            if (!response.ok) throw new Error('HTTP error! ' + response.status);
            const data = await response.json();
            setDebates(data);
        } catch (error) {
            console.error('Error fetching debates:', error);
        }
    };

    // When user clicks left or right side
    const vote = async (debateId, side) => {
        try {
            const body =
                side === 'red'
                    ? { debateId, votesRed: 1 }
                    : { debateId, votesBlue: 1 };

            // POST the vote
            const response = await fetch('/api/deliberate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
            if (!response.ok) {
                throw new Error('Failed to update votes');
            }

            // We get the updated doc back
            const updatedDoc = await response.json();

            // Update local state to reflect new vote counts
            setDebates((prev) =>
                prev.map((deb) =>
                    deb._id === debateId
                        ? {
                            ...deb,
                            votesRed: updatedDoc.votesRed,
                            votesBlue: updatedDoc.votesBlue,
                        }
                        : deb
                )
            );

            // Show the vote results
            setShowVotes(true);
        } catch (error) {
            console.error('Error submitting vote:', error);
            alert('Failed to submit vote.');
        }
    };

    // Move to the next debate in the array
    const nextDebate = () => {
        setShowVotes(false);
        setCurrentDebateIndex((prevIndex) => (prevIndex + 1) % debates.length);
    };

    // The currently displayed debate
    const currentDebate = debates[currentDebateIndex];

    // If no debates available, show a fallback
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
            <NavBar /> {/* remove if you don’t have a NavBar */}

            {/* Fullscreen Debate Section */}
            <div style={{ display: 'flex', height: '100%', width: '100%' }}>
                {/* Left side: Red */}
                <div
                    onClick={() => !showVotes && vote(currentDebate._id, 'red')}
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
                    onClick={() => !showVotes && vote(currentDebate._id, 'blue')}
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

// Option 1: getServerSideProps
export async function getServerSideProps() {
    const res = await fetch('http://localhost:3000/api/deliberate');
    let initialDebates = [];
    try {
        initialDebates = await res.json();
    } catch (error) {
        console.error('Error parsing JSON:', error);
    }

    return {
        props: { initialDebates },
    };
}
