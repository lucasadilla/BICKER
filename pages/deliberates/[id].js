import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { NextSeo } from 'next-seo';

export default function DeliberateDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [deliberate, setDeliberate] = useState(null);
  const [shareUrl, setShareUrl] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetchDeliberate = async () => {
      try {
        const res = await fetch(`/api/deliberate/${id}`);
        if (res.ok) {
          const data = await res.json();
          setDeliberate(data);
        } else {
          setDeliberate(null);
        }
      } catch (error) {
        console.error('Failed to load deliberation:', error);
        setDeliberate(null);
      } finally {
        setLoading(false);
      }
    };
    fetchDeliberate();
    if (typeof window !== 'undefined') {
      setShareUrl(window.location.href);
    }
  }, [id]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!deliberate) {
    return <div>Deliberation not found</div>;
  }

  const handleReport = async () => {
    const reason = prompt('Why are you reporting this deliberation?');
    if (!reason) return;
    const res = await fetch('/api/report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetId: deliberate._id, targetType: 'deliberate', reason })
    });
    if (res.ok) {
      alert('Report submitted');
    } else {
      const data = await res.json();
      alert(data.error || 'Failed to submit report');
    }
  };

  return (
    <div style={{ paddingTop: '70px' }}>
      <NextSeo
        title={`Deliberation: ${deliberate.instigateText}`}
        description={deliberate.debateText}
        canonical={`https://bicker.ca/deliberates/${deliberate._id}`}
        openGraph={{
          url: `https://bicker.ca/deliberates/${deliberate._id}`,
          title: `Deliberation: ${deliberate.instigateText}`,
          description: deliberate.debateText,
        }}
      />
      <h1 className="heading-1" style={{ textAlign: 'center' }}>{deliberate.instigateText}</h1>
      <p className="text-base" style={{ maxWidth: '600px', margin: '20px auto' }}>{deliberate.debateText}</p>
      <div style={{ textAlign: 'center', marginTop: '10px' }}>
        <Link href={{ pathname: '/deliberate', query: { id: deliberate._id } }}>
          Vote on this debate
        </Link>
      </div>
      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        <button
          onClick={() => navigator.clipboard.writeText(shareUrl)}
          style={{ marginRight: '10px', padding: '8px 12px' }}
        >
          Copy Link
        </button>
        <a
          href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{ marginRight: '10px' }}
        >
          Share on Twitter
        </a>
        <a
          href={`https://www.reddit.com/submit?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(deliberate.instigateText)}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          Share on Reddit
        </a>
      </div>
      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        <button onClick={handleReport}>Report</button>
      </div>
      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        <p className="text-base">Red: {deliberate.votesRed || 0} | Blue: {deliberate.votesBlue || 0}</p>
      </div>
    </div>
  );
}
