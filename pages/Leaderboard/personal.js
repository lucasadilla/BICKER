// pages/leaderboard/personal.js

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import NavBar from '../../components/NavBar';

export default function PersonalStats() {
    const [userDebates, setUserDebates] = useState([]);
    const [sortOption, setSortOption] = useState('newest');
    const [myVoteCount, setMyVoteCount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    const { data: session, status } = useSession();

    useEffect(() => {
        if (status === 'authenticated') {
            fetchPersonalStats();
        }
    }, [status, sortOption]);

    async function fetchPersonalStats() {
        try {
            setIsLoading(true);
            const response = await fetch(`/api/personal?sort=${sortOption}`);
            if (!response.ok) throw new Error('Failed to fetch personal stats');
            const data = await response.json();
            setUserDebates(data.debates);
            setMyVoteCount(data.myDebateCount);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }

    function handleSortChange(e) {
        setSortOption(e.target.value);
    }

    // If still loading session info, show a spinner or simple text
    if (status === 'loading') {
        return (
            <div style={{ 
                minHeight: '100vh',
                fontFamily: 'Arial, sans-serif',
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: '#4D94FF',
                justifyContent: 'center',
                alignItems: 'center',
                fontSize: '24px',
                color: '#666'
            }}>
                <NavBar />
                <div style={{
                    backgroundColor: 'white',
                    padding: '40px',
                    borderRadius: '20px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                }}>
                    Checking session...
                </div>
            </div>
        );
    }

    // If user is not logged in, show a bold message in the same style
    if (status === 'unauthenticated') {
        return (
            <div
                style={{
                    minHeight: '100vh',
                    fontFamily: 'Arial, sans-serif',
                    display: 'flex',
                    flexDirection: 'column',
                    backgroundColor: '#4D94FF',
                }}
            >
                <NavBar />
                <div style={{ 
                    flex: 1,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: '40px'
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        padding: '40px',
                        borderRadius: '20px',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                        textAlign: 'center',
                        maxWidth: '600px'
                    }}>
                        <h1 style={{ 
                            fontSize: '36px', 
                            color: '#333',
                            marginBottom: '20px'
                        }}>
                            Please sign in to see your personal stats
                        </h1>
                        <p style={{ 
                            fontSize: '18px',
                            color: '#666'
                        }}>
                            Sign in to track your debates and votes
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // Otherwise, user is authenticated -> show personal stats
    return (
        <div
            style={{
                minHeight: '100vh',
                fontFamily: 'Arial, sans-serif',
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: '#4D94FF',
            }}
        >
            <NavBar />
            <div
                style={{
                    padding: '40px',
                    marginTop: '70px',
                    flex: 1,
                    overflow: 'auto',
                }}
            >
                <div style={{ 
                    maxWidth: '1200px', 
                    margin: '0 auto',
                    backgroundColor: 'white',
                    borderRadius: '20px',
                    padding: '40px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                }}>
                    <h1 style={{ 
                        fontSize: '48px', 
                        textAlign: 'center', 
                        marginBottom: '30px',
                        color: '#333',
                        textShadow: '2px 2px 4px rgba(0, 0, 0, 0.1)'
                    }}>
                        Your Personal Stats
                    </h1>

                    <div style={{ 
                        display: 'flex', 
                        justifyContent: 'center', 
                        alignItems: 'center',
                        gap: '20px',
                        marginBottom: '30px',
                        flexWrap: 'wrap'
                    }}>
                        <div style={{
                            backgroundColor: '#4D94FF',
                            padding: '20px 40px',
                            borderRadius: '15px',
                            color: 'white',
                            textAlign: 'center',
                            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                            transition: 'transform 0.2s ease',
                            cursor: 'pointer',
                            ':hover': {
                                transform: 'translateY(-5px)'
                            }
                        }}>
                            <h3 style={{ margin: '0', fontSize: '24px' }}>Your Total Votes</h3>
                            <p style={{ margin: '10px 0 0', fontSize: '36px', fontWeight: 'bold' }}>{myVoteCount}</p>
                        </div>

                        <div style={{
                            backgroundColor: '#FF4D4D',
                            padding: '20px 40px',
                            borderRadius: '15px',
                            color: 'white',
                            textAlign: 'center',
                            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                            transition: 'transform 0.2s ease',
                            cursor: 'pointer',
                            ':hover': {
                                transform: 'translateY(-5px)'
                            }
                        }}>
                            <h3 style={{ margin: '0', fontSize: '24px' }}>Your Debates</h3>
                            <p style={{ margin: '10px 0 0', fontSize: '36px', fontWeight: 'bold' }}>{userDebates.length}</p>
                        </div>
                    </div>

                    <div style={{ 
                        textAlign: 'center', 
                        marginBottom: '30px',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: '10px'
                    }}>
                        <label
                            htmlFor="sort"
                            style={{
                                fontSize: '20px',
                                fontWeight: 'bold',
                                color: '#333'
                            }}
                        >
                            Sort By:
                        </label>
                        <select
                            id="sort"
                            onChange={handleSortChange}
                            value={sortOption}
                            style={{
                                fontSize: '16px',
                                padding: '10px 20px',
                                borderRadius: '8px',
                                border: '2px solid #4D94FF',
                                backgroundColor: 'white',
                                cursor: 'pointer',
                                outline: 'none',
                                transition: 'all 0.2s ease',
                                ':hover': {
                                    borderColor: '#FF4D4D'
                                }
                            }}
                        >
                            <option value="newest">Newest</option>
                            <option value="oldest">Oldest</option>
                            <option value="mostPopular">Most Popular</option>
                            <option value="mostDivisive">Most Divisive</option>
                            <option value="mostDecisive">Most Decisive</option>
                        </select>
                    </div>

                    {isLoading ? (
                        <div style={{ 
                            textAlign: 'center', 
                            padding: '40px',
                            fontSize: '20px',
                            color: '#666'
                        }}>
                            Loading your debates...
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            {userDebates.map((debate, index) => {
                                const total = (debate.votesRed || 0) + (debate.votesBlue || 0);
                                const redPercent = total > 0 ? ((debate.votesRed || 0) / total) * 100 : 50;
                                const bluePercent = 100 - redPercent;

                                return (
                                    <div
                                        key={debate._id}
                                        style={{
                                            backgroundColor: 'white',
                                            borderRadius: '15px',
                                            padding: '20px',
                                            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                                            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                                            ':hover': {
                                                transform: 'translateY(-2px)',
                                                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)'
                                            }
                                        }}
                                    >
                                        <div style={{ 
                                            display: 'flex', 
                                            gap: '20px', 
                                            marginBottom: '15px',
                                            flexWrap: 'wrap'
                                        }}>
                                            <div style={{ 
                                                flex: 1, 
                                                minWidth: '300px',
                                                padding: '20px', 
                                                backgroundColor: '#FF4D4D', 
                                                borderRadius: '12px', 
                                                color: 'white',
                                                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                                            }}>
                                                <h3 style={{ margin: '0 0 10px 0', fontSize: '18px', fontWeight: 'bold' }}>Instigate</h3>
                                                <p style={{ margin: 0, fontSize: '16px', lineHeight: '1.5' }}>{debate.instigateText}</p>
                                            </div>
                                            <div style={{ 
                                                flex: 1, 
                                                minWidth: '300px',
                                                padding: '20px', 
                                                backgroundColor: '#4D94FF', 
                                                borderRadius: '12px', 
                                                color: 'white',
                                                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                                            }}>
                                                <h3 style={{ margin: '0 0 10px 0', fontSize: '18px', fontWeight: 'bold' }}>Debate</h3>
                                                <p style={{ margin: 0, fontSize: '16px', lineHeight: '1.5' }}>{debate.debateText}</p>
                                            </div>
                                        </div>
                                        <div style={{ 
                                            display: 'flex', 
                                            flexDirection: 'column',
                                            padding: '15px',
                                            backgroundColor: '#f8f8f8',
                                            borderRadius: '8px'
                                        }}>
                                            <div style={{ 
                                                textAlign: 'center',
                                                padding: '0 0 15px 0',
                                                borderBottom: '1px solid #ddd'
                                            }}>
                                                <p style={{ margin: 0, color: '#666', fontWeight: 'bold', fontSize: '18px' }}>Total: {total}</p>
                                            </div>
                                            <div style={{ 
                                                display: 'flex', 
                                                justifyContent: 'space-between',
                                                alignItems: 'center'
                                            }}>
                                                <div style={{ flex: 1, textAlign: 'center' }}>
                                                    <div style={{ 
                                                        height: '4px', 
                                                        backgroundColor: '#FF4D4D',
                                                        width: `${redPercent}%`,
                                                        marginBottom: '5px'
                                                    }} />
                                                    <p style={{ margin: 0, color: '#FF4D4D', fontWeight: 'bold' }}>{debate.votesRed || 0} votes</p>
                                                </div>
                                                <div style={{ flex: 1, textAlign: 'center' }}>
                                                    <div style={{ 
                                                        height: '4px', 
                                                        backgroundColor: '#4D94FF',
                                                        width: `${bluePercent}%`,
                                                        marginBottom: '5px'
                                                    }} />
                                                    <p style={{ margin: 0, color: '#4D94FF', fontWeight: 'bold' }}>{debate.votesBlue || 0} votes</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
