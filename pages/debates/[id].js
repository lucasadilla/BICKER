import { NextSeo } from 'next-seo';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function DebateDetail({ debate }) {
  if (!debate) {
    return <div>Debate not found</div>;
  }

  const [shareUrl, setShareUrl] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setShareUrl(window.location.href);
    }
  }, []);

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
        <Link href={`/deliberate?id=${debate._id}`}>Vote on this debate</Link>
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
    </div>
  );
}

export async function getServerSideProps({ params, req }) {
  const protocol = req.headers["x-forwarded-proto"] || "http";
  const baseUrl = `${protocol}://${req.headers.host}`;
  try {
    const res = await fetch(`${baseUrl}/api/debate/${params.id}`);
    if (!res.ok) {
      return { notFound: true };
    }
    const debate = await res.json();
    return { props: { debate } };
  } catch (error) {
    console.error('Failed to load debate:', error);
    return { props: { debate: null } };
  }
}
