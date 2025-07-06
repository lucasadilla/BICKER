import { useState, useEffect } from 'react';
import NavBar from '../components/NavBar';

export default function Leaderboard() {
  const [debates, setDebates] = useState([]);
  const [sort, setSort] = useState('newest');

  useEffect(() => {
    const fetchDebates = async () => {
      try {
        const res = await fetch(`/api/debates/stats?sort=${sort}`);
        if (!res.ok) throw new Error('Failed to fetch debates');
        const data = await res.json();
        setDebates(data.debates || []);
      } catch (err) {
        console.error('Error fetching debates:', err);
      }
    };
    fetchDebates();
  }, [sort]);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#4D94FF', paddingTop: '60px' }}>
      <NavBar />
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '20px', color: 'white' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '20px' }}>Debate Leaderboard</h1>
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <select value={sort} onChange={(e) => setSort(e.target.value)} style={{ padding: '8px', borderRadius: '4px' }}>
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="mostDivisive">Most Divisive</option>
            <option value="mostDecisive">Most Decisive</option>
          </select>
        </div>
        {debates.map((debate) => (
          <div key={debate._id} style={{ backgroundColor: 'white', color: '#333', padding: '15px', borderRadius: '8px', marginBottom: '15px' }}>
            <p style={{ margin: '0 0 8px 0', fontWeight: 'bold' }}>{debate.instigateText}</p>
            <p style={{ margin: '0 0 8px 0' }}>{debate.debateText}</p>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#FF4D4D' }}>Red Votes: {debate.votesRed || 0}</span>
              <span style={{ color: '#4D94FF' }}>Blue Votes: {debate.votesBlue || 0}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
