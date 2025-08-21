// pages/deliberate/index.js
import { useState, useEffect } from 'react';

import { NextSeo } from 'next-seo';
import Link from 'next/link';

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

    // Subscribe to live vote updates
    useEffect(() => {
        const eventSource = new EventSource('/api/deliberate/live');

        eventSource.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                setDebates((prevDebates) =>
                    prevDebates.map((debate) =>
                        debate._id === data.debateId
                            ? { ...debate, votesRed: data.votesRed, votesBlue: data.votesBlue }
                            : debate
                    )
                );
            } catch (err) {
                console.error('Error parsing SSE data:', err);
            }
        };

        return () => {
            eventSource.close();
        };
    }, []);


    // If there were no initialDebates, fetch them client-side
    useEffect(() => {
        if (!initialDebates || initialDebates.length === 0) {
            fetchDeliberations();
        }
    }, [initialDebates]);

    // After voting, show results for 4 seconds before moving on
    useEffect(() => {
        if (showVotes) {
            const timer = setTimeout(() => {
                nextDebate();
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [showVotes]);

    const fetchDeliberations = async () => {
        try {
            const response = await fetch('/api/deliberate');
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || 'Failed to fetch deliberations');
            }

            // Shuffle the debates
            const shuffledDebates = shuffleArray(data);
            setDebates(shuffledDebates);
            
            // Reset current index if we have fewer debates
            if (shuffledDebates.length > 0 && currentDebateIndex >= shuffledDebates.length) {
                setCurrentDebateIndex(0);
            }
        } catch (error) {
            console.error('Error fetching deliberations:', error);
            alert(error.message);
        }
    };

    const handleVote = async (vote) => {

        try {
            const response = await fetch('/api/deliberate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    debateId: debates[currentDebateIndex]._id,
                    vote: vote
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                console.error('Vote failed:', data);
                throw new Error(data.details || data.error || 'Failed to update votes');
            }
            
            // Update the local state with the new vote counts
            const updatedDebates = [...debates];
            updatedDebates[currentDebateIndex] = {
                ...updatedDebates[currentDebateIndex],
                votesRed: data.votesRed || 0,
                votesBlue: data.votesBlue || 0
            };
            
            // Move to the next debate
            setDebates(updatedDebates);
            setShowVotes(true);
            setTimeout(() => {
                setShowVotes(false);
                setCurrentDebateIndex((prevIndex) => (prevIndex + 1) % debates.length);
            }, 2000);
        } catch (error) {
            console.error('Error voting:', error);
            alert(error.message || 'Failed to submit vote. Please try again.');
        }
    };

    const nextDebate = () => {
        setShowVotes(false);
        setCurrentDebateIndex((prevIndex) => (prevIndex + 1) % debates.length);
    };

    const currentDebate = debates[currentDebateIndex];

    const resetCollection = async () => {
        try {
            const response = await fetch('/api/deliberate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ reset: true }),
            });

            if (!response.ok) {
                throw new Error('Failed to reset collection');
            }

            // Refresh the page to load new data
            window.location.reload();
        } catch (error) {
            console.error('Error resetting collection:', error);
            alert('Failed to reset collection. Please try again.');
        }
    };

    // If no debates available, show fallback
    if (!currentDebate) {
        return (
            <div style={{ textAlign: 'center', marginTop: '50px' }}>
                <h2 className="heading-2">No debates available</h2>
                <p className="text-base">You've voted on all available debates! Check back later for new debates.</p>
                <button 
                    onClick={fetchDeliberations}
                    style={{
                        marginTop: '20px',
                        padding: '10px 20px',
                        backgroundColor: '#4D94FF',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer'
                    }}
                >
                    Check for New Debates
                </button>
                <button 
                    onClick={resetCollection}
                    style={{
                        marginTop: '20px',
                        marginLeft: '10px',
                        padding: '10px 20px',
                        backgroundColor: '#FF4D4D',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer'
                    }}
                >
                    Reset Collection
                </button>
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
                position: 'relative'
            }}
        >
            <NextSeo
                title="Deliberate - Bicker"
                description="Vote on debates and see how others feel."/>

            <button
                onClick={nextDebate}
                style={{
                    position: 'absolute',
                    top: '50%',
                    left: window.innerWidth <= 768 ? '50%' : redWidth,
                    transform: 'translate(-50%, -50%)',
                    padding: '10px 20px',
                    backgroundColor: '#f0f0f0',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    zIndex: 1000,
                    transition: 'left 1s ease'
                }}
            >
                Skip
            </button>

            {/* Fullscreen Debate Section */}
            <div style={{ 
                display: 'flex', 
                flexDirection: window.innerWidth <= 768 ? 'column' : 'row',
                height: '100%', 
                width: '100%' 
            }}>
                {/* Left side: Red */}
                <div
                    onClick={() => (!showVotes ? handleVote('red') : null)}
                    onMouseEnter={() => setHoveringSide('red')}
                    onMouseLeave={() => setHoveringSide('')}
                    style={{
                        width: window.innerWidth <= 768 ? '100%' : redWidth,
                        height: window.innerWidth <= 768 ? '50%' : '100%',
                        backgroundColor: hoveringSide === 'red' ? '#FF6A6A' : '#FF4D4D',
                        color: 'white',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        cursor: showVotes ? 'default' : 'pointer',
                        transition: 'width 1s ease, height 1s ease, background-color 0.3s ease',
                    }}
                    
                >
                    <p
                        className="heading-3"
                        style={{
                            textAlign: 'center',
                            margin: 0,
                            whiteSpace: 'normal',
                            wordBreak: 'break-word',
                            overflowWrap: 'break-word',
                            maxWidth: '80%',
                            padding: '0 10px',
                        }}
                    >
                        {currentDebate.instigateText || 'Unknown Instigate'}
                    </p>
                    {currentDebate.instigateVoiceNote && (
                        <audio
                            controls
                            src={`data:audio/webm;base64,${currentDebate.instigateVoiceNote}`}
                        />
                    )}
                    {currentDebate.instigator && (
                        <Link
                            href={`/user/${encodeURIComponent(currentDebate.instigator.username)}`}
                            style={{
                                marginTop: '10px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                color: 'white',
                                textDecoration: 'none',
                                fontSize: '0.875rem'
                            }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {currentDebate.instigator.profilePicture && (
                                <img
                                    src={currentDebate.instigator.profilePicture}
                                    alt={`${currentDebate.instigator.username} profile picture`}
                                    style={{ width: '24px', height: '24px', borderRadius: '50%' }}
                                />
                            )}
                            <span>{currentDebate.instigator.username}</span>
                        </Link>
                    )}
                    {showVotes && (
                        <p className="text-lg" style={{ marginTop: '20px' }}>
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
                        width: window.innerWidth <= 768 ? '100%' : blueWidth,
                        height: window.innerWidth <= 768 ? '50%' : '100%',
                        backgroundColor: hoveringSide === 'blue' ? '#76ACFF' : '#4D94FF',
                        color: 'white',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        cursor: showVotes ? 'default' : 'pointer',
                        transition: 'width 1s ease, height 1s ease, background-color 0.3s ease',
                    }}
                    
                >
                    <p
                        className="heading-3"
                        style={{
                            textAlign: 'center',
                            margin: 0,
                            whiteSpace: 'normal',
                            wordBreak: 'break-word',
                            overflowWrap: 'break-word',
                            maxWidth: '80%',
                            padding: '0 10px',
                        }}
                    >
                        {currentDebate.debateText || 'Unknown Debate'}
                    </p>
                    {currentDebate.debateVoiceNote && (
                        <audio
                            controls
                            src={`data:audio/webm;base64,${currentDebate.debateVoiceNote}`}
                        />
                    )}
                    {currentDebate.creator && (
                        <Link
                            href={`/user/${encodeURIComponent(currentDebate.creator.username)}`}
                            style={{
                                marginTop: '10px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                color: 'white',
                                textDecoration: 'none',
                                fontSize: '0.875rem'
                            }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {currentDebate.creator.profilePicture && (
                                <img
                                    src={currentDebate.creator.profilePicture}
                                    alt={`${currentDebate.creator.username} profile picture`}
                                    style={{ width: '24px', height: '24px', borderRadius: '50%' }}
                                />
                            )}
                            <span>{currentDebate.creator.username}</span>
                        </Link>
                    )}
                    {showVotes && (
                        <p className="text-lg" style={{ marginTop: '20px' }}>
                            Votes: {currentDebate.votesBlue || 0}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}

// Server-side props with randomized debates
export async function getServerSideProps(context) {
    const protocol = context.req.headers["x-forwarded-proto"] || "http";
    const host = context.req.headers["host"];
    const baseUrl = `${protocol}://${host}`;
    const res = await fetch(`${baseUrl}/api/deliberate`);
    let initialDebates = [];
    try {
        initialDebates = await res.json();

        // Better randomization using Fisher-Yates shuffle
        for (let i = initialDebates.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [initialDebates[i], initialDebates[j]] = [initialDebates[j], initialDebates[i]];
        }

        // Add a random starting index
        const randomStartIndex = Math.floor(Math.random() * initialDebates.length);
        initialDebates = [
            ...initialDebates.slice(randomStartIndex),
            ...initialDebates.slice(0, randomStartIndex),
        ];
    } catch (error) {
        console.error('Error parsing JSON:', error);
    }

    // If a specific debate ID is provided, fetch it and place it first
    const { id } = context.query;
    if (id) {
        try {
            const specificRes = await fetch(`${baseUrl}/api/deliberate/${id}`);
            if (specificRes.ok) {
                const specificDebate = await specificRes.json();
                initialDebates = [
                    specificDebate,
                    ...initialDebates.filter((debate) => debate._id !== specificDebate._id),
                ];
            }
        } catch (error) {
            console.error('Error fetching specific debate:', error);
        }
    }

    return {
        props: { initialDebates },
    };
}
