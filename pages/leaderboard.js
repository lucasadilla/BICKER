import { useState, useEffect } from 'react';
import NavBar from '../components/NavBar';

export default function Leaderboard() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch('/api/leaderboard');
        if (!res.ok) throw new Error('Failed to fetch leaderboard');
        const data = await res.json();
        setUsers(data.users || []);
      } catch (err) {
        console.error('Error fetching leaderboard:', err);
      }
    };
    fetchUsers();
  }, []);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#4D94FF', paddingTop: '60px' }}>
      <NavBar />
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '20px', color: 'white' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '20px' }}>Leaderboard</h1>
        {users.map((user, idx) => (
          <div key={user._id} style={{ display: 'flex', justifyContent: 'space-between', backgroundColor: 'white', color: '#333', padding: '10px', borderRadius: '8px', marginBottom: '10px' }}>
            <span>{idx + 1}. {user.email}</span>
            <span>{user.points} pts</span>
          </div>
        ))}
        {users.length === 0 && (
          <p style={{ textAlign: 'center' }}>No users found.</p>
        )}
      </div>
    </div>
  );
}
