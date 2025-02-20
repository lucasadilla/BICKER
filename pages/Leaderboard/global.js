// pages/leaderboard/global.js
import { useState, useEffect } from 'react';
import NavBar from '../../components/NavBar';

export default function GlobalStats() {
    const [debates, setDebates] = useState([]);
    const [sortOption, setSortOption] = useState('newest');
    const [totalVotes, setTotalVotes] = useState(0); // for live vote counter

    useEffect(() => {
        fetchDebates();
    }, [sortOption]);

    async function fetchDebates() {
        try {
            // Example: /api/debates/stats?sort=newest or ?sort=oldest etc.
            const response = await fetch(`/api/stats?sort=${sortOption}`);
            if (!response.ok) throw new Error('Failed to fetch');
            const data = await response.json();

            setDebates(data.debates);
            setTotalVotes(data.totalVotes); // The API can return total votes for the entire site
        } catch (error) {
            console.error('Error fetching global stats:', error);
        }
    }

    function handleSortChange(e) {
        setSortOption(e.target.value);
    }

    return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
            <NavBar />

            <div style={{ marginTop: '80px', padding: '20px' }}>
                <h1>Global Stats</h1>
                <div>
                    <label htmlFor="sort">Sort By:</label>
                    <select id="sort" onChange={handleSortChange} value={sortOption}>
                        <option value="newest">Newest</option>
                        <option value="oldest">Oldest</option>
                        <option value="mostPopular">Most Popular</option>
                        <option value="mostDivisive">Most Divisive</option>
                        <option value="mostDecisive">Most Decisive</option>
                    </select>
                </div>

                {/* Live counter of all votes */}
                <p>Total Votes (Site-wide): {totalVotes}</p>

                <hr />

                {/* Debate List */}
                {debates.map((debate) => (
                    <div key={debate._id} style={{ marginBottom: '20px' }}>
                        <h3>{debate.debateText}</h3>
                        <p>
                            Votes Red: {debate.votesRed} | Votes Blue: {debate.votesBlue} | Total:{' '}
                            {debate.votesRed + debate.votesBlue}
                        </p>
                        {/* You could show how close it was, or if it’s lopsided, etc. */}
                    </div>
                ))}
            </div>
        </div>
    );
}
