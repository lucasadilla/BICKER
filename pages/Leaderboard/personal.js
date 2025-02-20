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

    // If not logged in, you could show a message or sign-in button
    if (status === 'unauthenticated') {
        return (
            <div style={{ textAlign: 'center', marginTop: '100px' }}>
                <h1>Please sign in to see your stats.</h1>
            </div>
        );
    }

    if (status === 'loading') {
        return <p>Loading...</p>;
    }

    return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
            <NavBar />
            <div style={{ marginTop: '80px', padding: '20px' }}>
                <h1>Your Stats</h1>
                <label htmlFor="sort">Sort By:</label>
                <select id="sort" onChange={handleSortChange} value={sortOption}>
                    <option value="newest">Newest</option>
                    <option value="oldest">Oldest</option>
                    <option value="mostPopular">Most Popular</option>
                    <option value="mostDivisive">Most Divisive</option>
                    <option value="mostDecisive">Most Decisive</option>
                </select>

                <p>Your Total Votes (Deliberations): {myVoteCount}</p>
                <hr />

                {userDebates.map((debate) => (
                    <div key={debate._id} style={{ marginBottom: '20px' }}>
                        <h3>{debate.debateText}</h3>
                        <p>
                            Votes Red: {debate.votesRed} | Votes Blue: {debate.votesBlue} | Total:{' '}
                            {debate.votesRed + debate.votesBlue}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}
