import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Profile() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [form, setForm] = useState({ profilePicture: '', username: '', bio: '', selectedBadge: '', colorScheme: 'light' });
  const [badges, setBadges] = useState([]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetch('/api/profile')
        .then(res => res.json())
        .then(data => {
          setForm({
            profilePicture: data.profilePicture || '',
            username: data.username || '',
            bio: data.bio || '',
            selectedBadge: data.selectedBadge || '',
            colorScheme: data.colorScheme || 'light'
          });
          setBadges(data.badges || []);
        });
    }
  }, [status]);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = e => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setForm(prev => ({ ...prev, profilePicture: reader.result }));
    reader.readAsDataURL(file);
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
        <label>Profile Picture</label>
        <input type="file" accept="image/*" onChange={handleFileChange} />
        {form.profilePicture && (
          <img
            src={form.profilePicture}
            alt="Profile preview"
            style={{ width: '100px', height: '100px', objectFit: 'cover' }}
          />
        )}
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
        <label>Color Scheme</label>
        <select name="colorScheme" value={form.colorScheme} onChange={handleChange}>
          <option value="light">Light</option>
          <option value="dark">Dark</option>
          <option value="blue">Blue</option>
        </select>
        <button type="submit" style={{ marginTop: '10px' }}>Save</button>
      </form>
    </div>
  );
}
