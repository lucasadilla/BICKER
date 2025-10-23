import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { useColorScheme } from '../lib/ColorSchemeContext';
import badgeDescriptions from '../lib/badgeDescriptions';
import { useRouter } from 'next/router';

const normalizeColorScheme = value => {
  const normalized = (value || '').toString().toLowerCase();
  if (normalized === 'monochrome' || normalized === 'dark') {
    return 'monochrome';
  }
  return 'light';
};

export default function Profile() {
  const { status } = useSession();
  const router = useRouter();
  const { colorScheme: activeScheme, setColorScheme } = useColorScheme();
  const [form, setForm] = useState(() => ({
    profilePicture: '',
    username: '',
    bio: '',
    selectedBadge: '',
    colorScheme: normalizeColorScheme(activeScheme),
  }));
  const [badges, setBadges] = useState([]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetch('/api/profile')
        .then(res => res.json())
        .then(data => {
          const normalizedScheme = normalizeColorScheme(data.colorScheme);
          setForm({
            profilePicture: data.profilePicture || '',
            username: data.username || '',
            bio: data.bio || '',
            selectedBadge: data.selectedBadge || '',
            colorScheme: normalizedScheme,
          });
          setBadges(data.badges || []);
          setColorScheme(normalizedScheme);
        });
    }
  }, [setColorScheme, status]);

  useEffect(() => {
    const normalized = normalizeColorScheme(activeScheme);
    setForm(prev => (prev.colorScheme === normalized ? prev : { ...prev, colorScheme: normalized }));
  }, [activeScheme]);

  const handleChange = e => {
    const { name, value } = e.target;
    if (name === 'colorScheme') {
      const normalized = normalizeColorScheme(value);
      setForm(prev => ({ ...prev, colorScheme: normalized }));
      setColorScheme(normalized);
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
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
    <div className="profile-page">
      <h1>Edit Profile</h1>
      <form onSubmit={handleSubmit} className="profile-form">
        <label className="profile-label">Profile Picture</label>
        <input type="file" accept="image/*" onChange={handleFileChange} className="profile-input" />
        {form.profilePicture && (
          <img
            src={form.profilePicture}
            alt="Profile preview"
            className="profile-picture-preview"
          />
        )}
        <label className="profile-label">Username</label>
        <input name="username" value={form.username} onChange={handleChange} className="profile-input" />
        <label className="profile-label">Bio</label>
        <textarea name="bio" value={form.bio} onChange={handleChange} className="profile-input profile-textarea" />
        <label className="profile-label">Public Badge</label>
        <select name="selectedBadge" value={form.selectedBadge} onChange={handleChange} className="profile-input">
          <option value="">None</option>
          {badges.map(b => (
            <option key={b} value={b} title={badgeDescriptions[b] || b}>
              {b}
            </option>
          ))}
        </select>
        <label className="profile-label">Color Scheme</label>
        <select name="colorScheme" value={form.colorScheme} onChange={handleChange} className="profile-input">
          <option value="light">Light</option>
          <option value="monochrome">Monochrome</option>
        </select>
        <button
          type="submit"
          className="profile-button"
        >
          Save
        </button>
      </form>
    </div>
  );
}
