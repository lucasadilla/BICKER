import { useState, useEffect } from 'react';
import Link from 'next/link';
import { NextSeo } from 'next-seo';

export default function DeliberateDetail({ deliberate }) {
  if (!deliberate) {
    return <div>Deliberation not found</div>;
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
        <Link href={`/deliberate?id=${deliberate._id}`}>Vote on this debate</Link>
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
        <p className="text-base">Red: {deliberate.votesRed || 0} | Blue: {deliberate.votesBlue || 0}</p>
      </div>
    </div>
  );
}

export async function getServerSideProps({ params, req }) {
  const protocol = req.headers["x-forwarded-proto"] || "http";
  const baseUrl = `${protocol}://${req.headers.host}`;
  try {
    const res = await fetch(`${baseUrl}/api/deliberate/${params.id}`);
    if (!res.ok) {
      return { notFound: true };
    }
    const deliberate = await res.json();
    return { props: { deliberate } };
  } catch (error) {
    console.error('Failed to load deliberation:', error);
    return { props: { deliberate: null } };
  }
}
