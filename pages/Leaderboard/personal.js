// pages/leaderboard/personal.js

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import NavBar from '../../components/NavBar';

export default function PersonalStats() {
    const [userDebates, setUserDebates] = useState([]);
    const [sortOption, setSortOption] = useState('newest');
    const [myVoteCount, setMyVoteCount] = useState(0);

    const { data: session, status } = useSession();

    useEffect(() => {
        if (status === 'authenticated') {
            fetchPersonalStats();
        }
    }, [status, sortOption]);

    async function fetchPersonalStats() {
        try {
            // If your endpoint is /api/debates/personal, adjust accordingly:
            const response = await fetch(`/api/personal?sort=${sortOption}`);
            if (!response.ok) throw new Error('Failed to fetch personal stats');
            const data = await response.json();
            setUserDebates(data.debates);
            setMyVoteCount(data.myVoteCount);
        } catch (error) {
            console.error(error);
        }
    }

    function handleSortChange(e) {
        setSortOption(e.target.value);
    }

    // If still loading session info, show a spinner or simple text
    if (status === 'loading') {
        return <div style={{ textAlign: 'center', marginTop: '100px', fontSize: '24px' }}>
            Checking session...
        </div>;
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
                <div style={{ padding: '70px', marginTop: '70px', flex: 1, textAlign: 'center', color: 'white' }}>
                    <h1 style={{ fontSize: '48px' }}>Please sign in to see your personal stats.</h1>
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
                    padding: '70px',
                    marginTop: '70px',
                    color: 'white',
                    flex: 1,
                    overflow: 'auto',
                }}
            >
                <h1 style={{ fontSize: '48px', textAlign: 'center', marginBottom: '30px' }}>
                    Your Personal Stats
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

                <p style={{ fontSize: '20px', textAlign: 'center', marginBottom: '20px' }}>
                    Your Total Votes: <strong>{myVoteCount}</strong>
                </p>

                <hr style={{ marginBottom: '20px', border: '1px solid white' }} />

                {userDebates.map((debate) => {
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
