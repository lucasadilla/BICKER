// pages/leaderboard/global.js

import { useState, useEffect } from 'react';
import NavBar from '../../components/NavBar';

export default function GlobalStats() {
    const [debates, setDebates] = useState([]);
    const [sortOption, setSortOption] = useState('newest');
    const [totalVotes, setTotalVotes] = useState(0); // live vote counter

    useEffect(() => {
        fetchDebates();
    }, [sortOption]);

    async function fetchDebates() {
        try {
            // If your stats route is /api/debates/stats, use that:
            const response = await fetch(`/api/stats?sort=${sortOption}`);
            if (!response.ok) throw new Error('Failed to fetch');
            const data = await response.json();

            setDebates(data.debates);
            setTotalVotes(data.totalVotes);
        } catch (error) {
            console.error('Error fetching global stats:', error);
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
                backgroundColor: '#4D94FF', // or another color if you prefer
            }}
        >
            <NavBar />

            <div
                style={{
                    padding: '70px',
                    marginTop: '70px',
                    color: 'white',
                    flex: 1,
                    overflow: 'auto',
                }}
            >
                <h1 style={{ fontSize: '48px', textAlign: 'center', marginBottom: '30px' }}>
                    Global Stats
                </h1>

                <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                    <label
                        htmlFor="sort"
                        style={{
                            marginRight: '10px',
                            fontSize: '24px',
                            fontWeight: 'bold',
                        }}
                    >
                        Sort By:
                    </label>
                    <select
                        id="sort"
                        onChange={handleSortChange}
                        value={sortOption}
                        style={{
                            fontSize: '18px',
                            padding: '8px',
                            borderRadius: '4px',
                            border: '1px solid #ccc',
                        }}
                    >
                        <option value="newest">Newest</option>
                        <option value="oldest">Oldest</option>
                        <option value="mostPopular">Most Popular</option>
                        <option value="mostDivisive">Most Divisive</option>
                        <option value="mostDecisive">Most Decisive</option>
                    </select>
                </div>

                {/* Live counter of all votes */}
                <p style={{ fontSize: '20px', textAlign: 'center', marginBottom: '20px' }}>
                    Total Votes (Site-wide): <strong>{totalVotes}</strong>
                </p>

                <hr style={{ marginBottom: '20px', border: '1px solid white' }} />

                {/* Debate List */}
                {debates.map((debate) => {
                    const total = (debate.votesRed || 0) + (debate.votesBlue || 0);
                    return (
                        <div
                            key={debate._id}
                            style={{
                                marginBottom: '20px',
                                backgroundColor: 'rgba(0,0,0,0.1)',
                                borderRadius: '8px',
                                padding: '20px',
                            }}
                        >
                            <h3 style={{ fontSize: '28px', margin: '0 0 10px' }}>{debate.debateText}</h3>
                            <p style={{ fontSize: '18px', margin: 0 }}>
                                <strong>Votes Red:</strong> {debate.votesRed || 0} &nbsp;|&nbsp;
                                <strong>Votes Blue:</strong> {debate.votesBlue || 0} &nbsp;|&nbsp;
                                <strong>Total:</strong> {total}
                            </p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
