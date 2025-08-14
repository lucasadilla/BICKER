import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Profile() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [form, setForm] = useState({ avatar: '', username: '', bio: '', selectedBadge: '' });
  const [badges, setBadges] = useState([]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetch('/api/profile')
        .then(res => res.json())
        .then(data => {
          setForm({
            avatar: data.avatar || '',
            username: data.username || '',
            bio: data.bio || '',
            selectedBadge: data.selectedBadge || ''
          });
          setBadges(data.badges || []);
        });
    }
  }, [status]);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    await fetch('/api/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    router.reload();
  };

  if (status === 'loading') return <p>Loading...</p>;
  if (status === 'unauthenticated') return <p>Please sign in to edit your profile.</p>;

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '80px auto' }}>
      <h1>Edit Profile</h1>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <label>Avatar URL</label>
        <input name="avatar" value={form.avatar} onChange={handleChange} />
        <label>Username</label>
        <input name="username" value={form.username} onChange={handleChange} />
        <label>Bio</label>
        <textarea name="bio" value={form.bio} onChange={handleChange} />
        <label>Public Badge</label>
        <select name="selectedBadge" value={form.selectedBadge} onChange={handleChange}>
          <option value="">None</option>
          {badges.map(b => (
            <option key={b} value={b}>{b}</option>
          ))}
        </select>
        <button type="submit" style={{ marginTop: '10px' }}>Save</button>
      </form>
    </div>
  );
}
