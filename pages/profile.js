import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { useColorScheme } from '../lib/ColorSchemeContext';
import badgeDescriptions from '../lib/badgeDescriptions';
import { useRouter } from 'next/router';

export default function Profile() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [form, setForm] = useState({ profilePicture: '', username: '', bio: '', selectedBadge: '', colorScheme: 'default' });
  const [badges, setBadges] = useState([]);
  const { colorScheme, setColorScheme } = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  const normalizeColorScheme = value => {
    if (!value) return 'default';
    if (value === 'blue' || value === 'light') return 'default';
    return value;
  };

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
            colorScheme: normalizeColorScheme(data.colorScheme)
          });
          setBadges(data.badges || []);
        });
    }
  }, [status]);

  const handleChange = e => {
    const { name, value } = e.target;
    const normalizedValue = name === 'colorScheme' ? normalizeColorScheme(value) : value;
    setForm(prev => ({ ...prev, [name]: normalizedValue }));
    if (name === 'colorScheme') {
      setColorScheme(normalizedValue);
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
      body: JSON.stringify({ ...form, colorScheme: normalizeColorScheme(form.colorScheme) })
    });
    router.reload();
  };

  if (status === 'loading') return <p>Loading...</p>;
  if (status === 'unauthenticated') return <p>Please sign in to edit your profile.</p>;

  const pageBackground = isDarkMode ? '#000000' : '#4D94FF';
  const textColor = isDarkMode ? '#f5f5f5' : '#ffffff';
  const fieldBorderColor = isDarkMode ? '#333333' : 'rgba(255, 255, 255, 0.7)';
  const fieldBackgroundColor = isDarkMode ? '#111111' : 'rgba(255, 255, 255, 0.05)';

  const inputStyle = {
    padding: '10px',
    borderRadius: '8px',
    border: `1px solid ${fieldBorderColor}`,
    backgroundColor: fieldBackgroundColor,
    color: textColor,
  };

  const selectStyle = {
    ...inputStyle,
    backgroundColor: isDarkMode ? '#111111' : '#ffffff',
    color: isDarkMode ? '#f5f5f5' : '#000000',
  };

  const labelStyle = {
    color: textColor,
    fontWeight: '600',
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: pageBackground,
        padding: '80px 20px',
        boxSizing: 'border-box',
      }}
    >
      <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto', color: textColor }}>
        <h1>Edit Profile</h1>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <label style={labelStyle}>Profile Picture</label>
          <input type="file" accept="image/*" onChange={handleFileChange} style={inputStyle} />
          {form.profilePicture && (
            <img
              src={form.profilePicture}
              alt="Profile preview"
              style={{ width: '100px', height: '100px', objectFit: 'cover' }}
            />
          )}
          <label style={labelStyle}>Username</label>
          <input name="username" value={form.username} onChange={handleChange} style={inputStyle} />
          <label style={labelStyle}>Bio</label>
          <textarea name="bio" value={form.bio} onChange={handleChange} style={{ ...inputStyle, minHeight: '120px' }} />
          <label style={labelStyle}>Public Badge</label>
          <select name="selectedBadge" value={form.selectedBadge} onChange={handleChange} style={selectStyle}>
            <option value="" style={{ color: isDarkMode ? '#f5f5f5' : '#000000', backgroundColor: isDarkMode ? '#111111' : '#ffffff' }}>None</option>
            {badges.map(b => (
              <option key={b} value={b} title={badgeDescriptions[b] || b} style={{ color: isDarkMode ? '#f5f5f5' : '#000000', backgroundColor: isDarkMode ? '#111111' : '#ffffff' }}>
                {b}
              </option>
            ))}
          </select>
          <label style={labelStyle}>Color Scheme</label>
          <select name="colorScheme" value={form.colorScheme} onChange={handleChange} style={selectStyle}>
            <option value="default" style={{ color: isDarkMode ? '#f5f5f5' : '#000000', backgroundColor: isDarkMode ? '#111111' : '#ffffff' }}>Default</option>
            <option value="dark" style={{ color: isDarkMode ? '#f5f5f5' : '#000000', backgroundColor: isDarkMode ? '#111111' : '#ffffff' }}>Dark</option>
          </select>
          <button
            type="submit"
            style={{
              marginTop: '10px',
              padding: '10px 16px',
              borderRadius: '999px',
              border: `1px solid ${fieldBorderColor}`,
              backgroundColor: 'transparent',
              color: textColor,
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            Save
          </button>
        </form>
      </div>
    </div>
  );
}
