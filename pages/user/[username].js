import dbConnect from '../../lib/dbConnect';
import User from '../../models/User';
import Deliberate from '../../models/Deliberate';

export default function UserProfile({ user, debates }) {
  if (!user) {
    return <div style={{ padding: '20px', maxWidth: '800px', margin: '80px auto' }}>User not found.</div>;
  }

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '80px auto' }}>
      {user.profilePicture && (
        <img
          src={user.profilePicture}
          alt={`${user.username} profile picture`}
          style={{ width: '150px', height: '150px', objectFit: 'cover', borderRadius: '50%' }}
        />
      )}
      <h1>{user.username}</h1>
      <h2 style={{ marginTop: '20px' }}>Debates Participated</h2>
      {debates.length === 0 ? (
        <p>No debates found.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {debates.map((d) => (
            <li key={d._id} style={{ marginBottom: '15px', backgroundColor: 'white', padding: '10px', borderRadius: '8px' }}>
              <p style={{ margin: 0, color: '#FF4D4D' }}>{d.instigateText}</p>
              <p style={{ margin: 0, color: '#4D94FF' }}>{d.debateText}</p>
            </li>
          ))}
        </ul>
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
      },
      debates,
    },
  };
}
