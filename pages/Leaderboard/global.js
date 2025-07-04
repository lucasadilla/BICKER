// pages/leaderboard/global.js

import { useState, useEffect } from 'react';
import Link from 'next/link';
import NavBar from '../../components/NavBar';

export default function GlobalStats() {
    const [debates, setDebates] = useState([]);
    const [sortOption, setSortOption] = useState('newest');
    const [totalVotes, setTotalVotes] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchDebates();
    }, [sortOption]);

    async function fetchDebates() {
        try {
            setIsLoading(true);
            const response = await fetch(`/api/debates/stats?sort=${sortOption}`);
            if (!response.ok) throw new Error('Failed to fetch');
            const data = await response.json();
            setDebates(data.debates);
            setTotalVotes(data.totalVotes);
        } catch (error) {
            console.error('Error fetching global stats:', error);
        } finally {
            setIsLoading(false);
        }
    }

    function handleSortChange(e) {
        setSortOption(e.target.value);
    }

    return (
        <div
            style={{
                fontFamily: 'Arial, sans-serif',
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: '#FF4D4D',
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
                        Global Stats
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
                            <h3 style={{ margin: '0', fontSize: '24px' }}>Total Votes</h3>
                            <p style={{ margin: '10px 0 0', fontSize: '36px', fontWeight: 'bold' }}>{totalVotes}</p>
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
                            <h3 style={{ margin: '0', fontSize: '24px' }}>Total Debates</h3>
                            <p style={{ margin: '10px 0 0', fontSize: '36px', fontWeight: 'bold' }}>{debates.length}</p>
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
                            Loading debates...
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            {debates.map((debate, index) => {
                                const total = (debate.votesRed || 0) + (debate.votesBlue || 0);
                                const redPercent = total > 0 ? ((debate.votesRed || 0) / total) * 100 : 50;
                                const bluePercent = 100 - redPercent;

                                return (
                                    <Link key={debate._id} href={`/debates/${debate._id}`} passHref>
                                    <div
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
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            padding: '15px',
                                            backgroundColor: '#f8f8f8',
                                            borderRadius: '8px'
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
                                            <div style={{ 
                                                flex: 1, 
                                                textAlign: 'center',
                                                padding: '0 20px',
                                                borderLeft: '1px solid #ddd',
                                                borderRight: '1px solid #ddd'
                                            }}>
                                                <p style={{ margin: 0, color: '#666', fontWeight: 'bold' }}>Total: {total}</p>
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
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
