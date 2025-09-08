import { useState } from 'react';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../api/auth/[...nextauth]';
import dbConnect from '../../lib/dbConnect';
import Banner from '../../models/Banner';

export default function BannerAdmin({ initialUrl }) {
  const [imageUrl, setImageUrl] = useState(initialUrl || '');
  const [message, setMessage] = useState('');

  const updateBanner = async () => {
    const res = await fetch('/api/banner', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageUrl }),
    });
    if (res.ok) {
      setMessage('Banner updated');
    } else {
      setMessage('Error updating banner');
    }
  };

  return (
    <div style={{ paddingTop: '70px', maxWidth: '800px', margin: '0 auto' }}>
      <h1 className="heading-1">Front Page Banner</h1>
      <input
        type="text"
        value={imageUrl}
        onChange={(e) => setImageUrl(e.target.value)}
        placeholder="Image URL"
        style={{ width: '100%', marginBottom: '10px' }}
      />
      <button onClick={updateBanner}>Update Banner</button>
      {message && <p>{message}</p>}
      {imageUrl && (
        <img src={imageUrl} alt="Banner preview" style={{ width: '100%', marginTop: '20px' }} />
      )}
    </div>
  );
}

export async function getServerSideProps(context) {
  const session = await getServerSession(context.req, context.res, authOptions);
  const admins = (process.env.ADMIN_EMAILS || '').split(',').map(a => a.trim());
  if (!session || !admins.includes(session.user.email)) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }
  await dbConnect();
  const banner = await Banner.findOne({}).lean();
  return {
    props: {
      initialUrl: banner ? banner.imageUrl : '',
    },
  };
}
