import { NextSeo } from 'next-seo';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function DebateDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [debate, setDebate] = useState(null);
  const [shareUrl, setShareUrl] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetchDebate = async () => {
      try {
        const res = await fetch(`/api/debate/${id}`);
        if (res.ok) {
          const data = await res.json();
          setDebate(data);
        } else {
          setDebate(null);
        }
      } catch (error) {
        console.error('Failed to load debate:', error);
        setDebate(null);
      } finally {
        setLoading(false);
      }
    };
    fetchDebate();
    if (typeof window !== 'undefined') {
      setShareUrl(window.location.href);
    }
  }, [id]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!debate) {
    return <div>Debate not found</div>;
  }

  const handleReport = async () => {
    const reason = prompt('Why are you reporting this debate?');
    if (!reason) return;
    const res = await fetch('/api/report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetId: debate._id, targetType: 'debate', reason })
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
        title={`Debate: ${debate.instigateText}`}
        description={debate.debateText}
        canonical={`https://bicker.ca/debates/${debate._id}`}
        openGraph={{
          url: `https://bicker.ca/debates/${debate._id}`,
          title: `Debate: ${debate.instigateText}`,
          description: debate.debateText,
        }}
      />
      <h1 className="heading-1" style={{ textAlign: 'center' }}>{debate.instigateText}</h1>
      <p className="text-base" style={{ maxWidth: '600px', margin: '20px auto' }}>{debate.debateText}</p>
      <div style={{ textAlign: 'center', marginTop: '10px' }}>
        <Link href={{ pathname: '/deliberate', query: { id: debate._id } }}>
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
          href={`https://www.reddit.com/submit?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(debate.instigateText)}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          Share on Reddit
        </a>
      </div>
      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        <button onClick={handleReport}>Report</button>
      </div>
    </div>
  );
}
