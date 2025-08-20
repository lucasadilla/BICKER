import { useState, useEffect } from 'react';
import dbConnect from '../../lib/dbConnect';
import User from '../../models/User';
import Deliberate from '../../models/Deliberate';

export default function UserProfile({ user, debates }) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!user) {
    return <div style={{ padding: '20px', maxWidth: '800px', margin: '80px auto' }}>User not found.</div>;
  }

  return (
    <div style={{ padding: '20px', paddingTop: '80px', maxWidth: '800px', margin: '0 auto', minHeight: '100vh', backgroundColor: 'red', color: 'white' }}>
      {user.profilePicture && (
        <img
          src={user.profilePicture}
          alt={`${user.username} profile picture`}
          style={{ width: '150px', height: '150px', objectFit: 'cover', borderRadius: '50%' }}
        />
      )}
      <h1>{user.username}</h1>
      {user.bio && <p>{user.bio}</p>}
      {user.selectedBadge && <p>Badge: {user.selectedBadge}</p>}
      <h2 style={{ marginTop: '20px' }}>Debates Participated</h2>
      {debates.length === 0 ? (
        <p>No debates found.</p>
      ) : (
        <div>
          {debates.map((d) => (
            <div
              key={d._id}
              style={{
                backgroundColor: 'white',
                color: '#333',
                padding: '15px',
                borderRadius: '8px',
                marginBottom: '25px'
              }}
            >
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
                  <p className={isMobile ? 'text-base' : 'text-lg'} style={{ margin: 0 }}>
                    {d.instigateText}
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
                  <p className={isMobile ? 'text-base' : 'text-lg'} style={{ margin: 0 }}>
                    {d.debateText}
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
                <span style={{ color: '#FF4D4D' }}>Red Votes: {d.votesRed || 0}</span>
                <span style={{ color: '#4D94FF' }}>Blue Votes: {d.votesBlue || 0}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export async function getServerSideProps({ params }) {
  await dbConnect();
  const { username } = params;
  const identifier = decodeURIComponent(username);
  const user = await User.findOne({ $or: [{ username: identifier }, { email: identifier }] }).lean();
  if (!user) {
    return { props: { user: null, debates: [] } };
  }
  const debatesDocs = await Deliberate.find({
    $or: [
      { createdBy: user.email },
      { instigatedBy: user.email }
    ]
  }).sort({ createdAt: -1 }).lean();
  const debates = debatesDocs.map((d) => ({
    _id: d._id.toString(),
    instigateText: d.instigateText,
    debateText: d.debateText,
    votesRed: d.votesRed || 0,
    votesBlue: d.votesBlue || 0,
  }));
  return {
    props: {
      user: {
        username: user.username || user.email,
        profilePicture: user.profilePicture || '',
        bio: user.bio || '',
        selectedBadge: user.selectedBadge || '',
      },
      debates,
    },
  };
}
