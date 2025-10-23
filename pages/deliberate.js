// pages/deliberate/index.js
import { useState, useEffect, useLayoutEffect, useRef } from 'react';

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
    const voteInFlightRef = useRef(new Set());
    const advanceTimeoutRef = useRef(null);
    const debatesRef = useRef(debates);
    const [hoveringSide, setHoveringSide] = useState('');
    const [isMobile, setIsMobile] = useState(false);
    const useIsomorphicLayoutEffect =
        typeof window !== 'undefined' ? useLayoutEffect : useEffect;

    const leftSideColor = hoveringSide === 'red' ? '#FF6A6A' : '#FF4D4D';
    const rightSideColor = hoveringSide === 'blue' ? '#76ACFF' : '#4D94FF';

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

    useEffect(() => {
        debatesRef.current = debates;
    }, [debates]);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        if (typeof window !== 'undefined') {
            handleResize();
            window.addEventListener('resize', handleResize);
            return () => window.removeEventListener('resize', handleResize);
        }
    }, []);

    useEffect(() => () => {
        if (advanceTimeoutRef.current) {
            clearTimeout(advanceTimeoutRef.current);
            advanceTimeoutRef.current = null;
        }
    }, []);

    // Subscribe to live vote updates
    useEffect(() => {
        const eventSource = new EventSource('/api/deliberate/live');

        eventSource.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);

                setDebates((prevDebates) =>
                    prevDebates.map((debate) => {
                        if (debate._id !== data.debateId) {
                            return debate;
                        }

                        const updatedDebate = {
                            ...debate,
                            ...(typeof data.votesRed === 'number'
                                ? { votesRed: data.votesRed }
                                : {}),
                            ...(typeof data.votesBlue === 'number'
                                ? { votesBlue: data.votesBlue }
                                : {}),
                        };

                        if (data.reactions && typeof data.reactions === 'object') {
                            const currentReactions = debate.reactions || {};
                            const hasRed = Object.prototype.hasOwnProperty.call(
                                data.reactions,
                                'red'
                            );
                            const hasBlue = Object.prototype.hasOwnProperty.call(
                                data.reactions,
                                'blue'
                            );

                            updatedDebate.reactions = {
                                red: hasRed
                                    ? { ...(data.reactions.red || {}) }
                                    : { ...(currentReactions.red || {}) },
                                blue: hasBlue
                                    ? { ...(data.reactions.blue || {}) }
                                    : { ...(currentReactions.blue || {}) },
                            };
                        }

                        return updatedDebate;
                    })
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

    const removeDebateFromList = (debateId) => {
        setDebates((prevDebates) => {
            const filteredDebates = prevDebates.filter((debate) => debate._id !== debateId);

            setCurrentDebateIndex((prevIndex) => {
                if (filteredDebates.length === 0) {
                    return 0;
                }

                const removedDebateIndex = prevDebates.findIndex((debate) => debate._id === debateId);

                if (removedDebateIndex === -1) {
                    return prevIndex >= filteredDebates.length ? 0 : prevIndex % filteredDebates.length;
                }

                return removedDebateIndex >= filteredDebates.length ? 0 : removedDebateIndex;
            });

            return filteredDebates;
        });
    };

    const handleVote = async (vote) => {
        if (debates.length === 0) {
            return;
        }

        const currentDebate = debates[currentDebateIndex];
        if (!currentDebate) {
            return;
        }

        const currentDebateId = currentDebate._id;
        if (voteInFlightRef.current.has(currentDebateId) || showVotes) {
            return;
        }

        const previousVotes = {
            votesRed: currentDebate.votesRed ?? 0,
            votesBlue: currentDebate.votesBlue ?? 0,
        };

        voteInFlightRef.current.add(currentDebateId);
        setHoveringSide('');
        setShowVotes(true);

        setDebates((prevDebates) =>
            prevDebates.map((debate) =>
                debate._id === currentDebateId
                    ? {
                        ...debate,
                        votesRed:
                            (debate.votesRed ?? 0) + (vote === 'red' ? 1 : 0),
                        votesBlue:
                            (debate.votesBlue ?? 0) + (vote === 'blue' ? 1 : 0),
                    }
                    : debate
            )
        );

        try {
            const response = await fetch('/api/deliberate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    debateId: currentDebateId,
                    vote: vote,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                console.error('Vote failed:', data);
                throw new Error(data.details || data.error || 'Failed to update votes');
            }

            setDebates((prevDebates) =>
                prevDebates.map((debate) =>
                    debate._id === currentDebateId
                        ? {
                            ...debate,
                            votesRed: data.votesRed ?? (debate.votesRed ?? previousVotes.votesRed),
                            votesBlue: data.votesBlue ?? (debate.votesBlue ?? previousVotes.votesBlue),
                        }
                        : debate
                )
            );

            if (advanceTimeoutRef.current) {
                clearTimeout(advanceTimeoutRef.current);
            }

            advanceTimeoutRef.current = setTimeout(() => {
                advanceTimeoutRef.current = null;
                removeDebateFromList(currentDebateId);
                setShowVotes(false);
                setHoveringSide('');
            }, 2000);
        } catch (error) {
            console.error('Error voting:', error);
            alert(error.message || 'Failed to submit vote. Please try again.');

            if (advanceTimeoutRef.current) {
                clearTimeout(advanceTimeoutRef.current);
                advanceTimeoutRef.current = null;
            }

            setShowVotes(false);
            setDebates((prevDebates) =>
                prevDebates.map((debate) =>
                    debate._id === currentDebateId
                        ? {
                            ...debate,
                            votesRed: previousVotes.votesRed,
                            votesBlue: previousVotes.votesBlue,
                        }
                        : debate
                )
            );
        } finally {
            voteInFlightRef.current.delete(currentDebateId);
        }
    };

    const nextDebate = () => {
        if (advanceTimeoutRef.current) {
            clearTimeout(advanceTimeoutRef.current);
            advanceTimeoutRef.current = null;
        }

        if (debatesRef.current.length === 0) {
            setShowVotes(false);
            return;
        }

        setHoveringSide('');
        setShowVotes(false);
        setCurrentDebateIndex((prevIndex) => {
            const totalDebates = debatesRef.current.length;
            if (totalDebates === 0) {
                return 0;
            }
            return (prevIndex + 1) % totalDebates;
        });
    };

    const currentDebate = debates[currentDebateIndex];
    const isCurrentDebatePending = currentDebate
        ? showVotes || voteInFlightRef.current.has(currentDebate._id)
        : false;

    const handleShare = () => {
        if (!currentDebate) {
            return;
        }
        const url = `${window.location.origin}/deliberate?id=${currentDebate._id}`;
        if (navigator.share) {
            navigator.share({ title: 'Deliberation', url });
        } else {
            navigator.clipboard.writeText(url);
            alert('Link copied to clipboard');
        }
    };

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
    const redSize = showVotes ? `${redPercent}%` : '50%';
    const blueSize = showVotes ? `${bluePercent}%` : '50%';

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
                    onClick={() => (!isCurrentDebatePending ? nextDebate() : null)}
                    style={{
                        position: 'absolute',
                        top: isMobile ? redSize : '50%',
                        left: isMobile ? 'calc(50% - 80px)' : redSize,
                        transform: 'translate(-50%, -50%)',
                        padding: '10px 20px',
                        backgroundColor: '#f0f0f0',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: isCurrentDebatePending ? 'default' : 'pointer',
                        zIndex: 1000,
                        transition: 'left 1s ease, top 1s ease'
                    }}
                >
                    Skip
                </button>

                <button
                    onClick={() => (!isCurrentDebatePending ? handleShare() : null)}
                    style={{
                        position: 'absolute',
                        top: isMobile ? redSize : '75%',
                        left: isMobile ? 'calc(50% + 80px)' : redSize,
                        transform: 'translate(-50%, -50%)',
                        padding: '10px 20px',
                        backgroundColor: '#f0f0f0',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: isCurrentDebatePending ? 'default' : 'pointer',
                        zIndex: 1000,
                        transition: 'left 1s ease, top 1s ease'
                    }}
                >
                    Share
                </button>

            {/* Fullscreen Debate Section */}
            <div style={{ 
                display: 'flex', 
                flexDirection: isMobile ? 'column' : 'row',
                height: '100%', 
                width: '100%' 
            }}>
                {/* Left side: Red */}
                <div
                    onClick={() => (!isCurrentDebatePending ? handleVote('red') : null)}
                    onMouseEnter={() => setHoveringSide('red')}
                    onMouseLeave={() => setHoveringSide('')}
                    style={{
                        width: isMobile ? '100%' : redSize,
                        height: isMobile ? redSize : '100%',
                        backgroundColor: leftSideColor,
                        color: 'white',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        cursor: isCurrentDebatePending ? 'default' : 'pointer',
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
                    {showVotes && totalVotes > 0 && (
                        <p className="text-lg" style={{ marginTop: '20px' }}>
                            Votes: {currentDebate.votesRed || 0}
                        </p>
                    )}
                </div>

                {/* Right side: Blue */}
                <div
                    onClick={() => (!isCurrentDebatePending ? handleVote('blue') : null)}
                    onMouseEnter={() => setHoveringSide('blue')}
                    onMouseLeave={() => setHoveringSide('')}
                    style={{
                        width: isMobile ? '100%' : blueSize,
                        height: isMobile ? blueSize : '100%',
                        backgroundColor: rightSideColor,
                        color: 'white',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        cursor: isCurrentDebatePending ? 'default' : 'pointer',
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
                    {showVotes && totalVotes > 0 && (
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
    const headers = {};

    if (context.req.headers.cookie) {
        headers.cookie = context.req.headers.cookie;
    }

    const res = await fetch(`${baseUrl}/api/deliberate`, { headers });
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
            const specificRes = await fetch(`${baseUrl}/api/deliberate/${id}`, { headers });
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
