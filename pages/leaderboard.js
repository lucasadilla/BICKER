import { useState, useEffect } from 'react';
import NavBar from '../components/NavBar';

export default function Leaderboard() {
  const [debates, setDebates] = useState([]);
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalDebates, setTotalDebates] = useState(0);
  const [totalVotes, setTotalVotes] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const fetchDebates = async () => {
      try {
        const res = await fetch(`/api/debates/stats?sort=${sort}&page=${page}`);
        if (!res.ok) throw new Error('Failed to fetch debates');
        const data = await res.json();
        setDebates(data.debates || []);
        setTotalVotes(data.totalVotes || 0);
        setTotalDebates(data.totalDebates || 0);
        setTotalPages(Math.ceil((data.totalDebates || 0) / 25) || 1);
      } catch (err) {
        console.error('Error fetching debates:', err);
      }
    };
    fetchDebates();
  }, [sort, page]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#4D94FF', paddingTop: '60px' }}>
      <NavBar />
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '20px', color: 'white' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '10px' }}>Debate Leaderboard</h1>
        <p style={{ textAlign: 'center', marginBottom: '20px' }}>
          Total Debates: {totalDebates} | Total Votes: {totalVotes}
        </p>
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <select value={sort} onChange={(e) => setSort(e.target.value)} style={{ padding: '8px', borderRadius: '4px' }}>
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="mostDivisive">Most Divisive</option>
            <option value="mostDecisive">Most Decisive</option>
          </select>
        </div>
        {debates.map((debate) => (
          <div key={debate._id} style={{ backgroundColor: 'white', color: '#333', padding: '15px', borderRadius: '8px', marginBottom: '25px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div
                style={{
                  alignSelf: 'flex-start',
                  maxWidth: isMobile ? '80%' : '60%',
                  backgroundColor: '#FF4D4D',
                  color: 'white',
                  padding: '12px 16px',
                  borderRadius: '16px',
                  borderTopLeftRadius: '4px',
                  marginLeft: 0,
                  boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                }}
              >
                <p style={{ margin: 0, fontSize: isMobile ? '16px' : '18px', lineHeight: '1.4' }}>
                  {debate.instigateText}
                </p>
              </div>
              <div
                style={{
                  alignSelf: 'flex-end',
                  maxWidth: isMobile ? '80%' : '60%',
                  backgroundColor: '#4D94FF',
                  color: 'white',
                  padding: '12px 16px',
                  borderRadius: '16px',
                  borderTopRightRadius: '4px',
                  marginRight: 0,
                  boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                }}
              >
                <p style={{ margin: 0, fontSize: isMobile ? '16px' : '18px', lineHeight: '1.4' }}>
                  {debate.debateText}
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
              <span style={{ color: '#FF4D4D' }}>Red Votes: {debate.votesRed || 0}</span>
              <span style={{ color: '#4D94FF' }}>Blue Votes: {debate.votesBlue || 0}</span>
            </div>
          </div>
        ))}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '20px' }}>
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
            Prev
          </button>
          <span>Page {page} of {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
