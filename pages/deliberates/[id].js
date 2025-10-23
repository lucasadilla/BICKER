import { useState, useEffect } from 'react';
import Link from 'next/link';
import { NextSeo } from 'next-seo';

const DEFAULT_REACTION_EMOJIS = ['🔥', '😂', '🤔', '😮', '👏'];

const toPlainObject = counts => {
  if (!counts) {
    return {};
  }

  if (counts instanceof Map) {
    return Array.from(counts.entries()).reduce((acc, [emoji, value]) => {
      acc[emoji] = value;
      return acc;
    }, {});
  }

  return counts;
};

const sumReactionValues = (counts = {}) =>
  Object.values(counts || {}).reduce((total, value) => total + (typeof value === 'number' ? value : 0), 0);

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

  const reactionCountsBySide = {
    red: toPlainObject(deliberate?.reactionCounts?.red || deliberate?.reactions?.red),
    blue: toPlainObject(deliberate?.reactionCounts?.blue || deliberate?.reactions?.blue)
  };

  const reactionEmojiSet = new Set(DEFAULT_REACTION_EMOJIS);
  Object.keys(reactionCountsBySide.red || {}).forEach(emoji => reactionEmojiSet.add(emoji));
  Object.keys(reactionCountsBySide.blue || {}).forEach(emoji => reactionEmojiSet.add(emoji));
  const reactionEmojiList = Array.from(reactionEmojiSet);

  const reactionTotals = deliberate?.reactionTotals || {
    red: sumReactionValues(reactionCountsBySide.red),
    blue: sumReactionValues(reactionCountsBySide.blue)
  };

  const totalReactions =
    typeof deliberate?.totalReactions === 'number'
      ? deliberate.totalReactions
      : reactionTotals.red + reactionTotals.blue;

  const getReactionCount = (side, emoji) => {
    const counts = reactionCountsBySide?.[side];
    if (!counts) {
      return 0;
    }
    const value = counts?.[emoji];
    return typeof value === 'number' ? value : 0;
  };

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
      <div
        style={{
          maxWidth: '900px',
          margin: '30px auto',
          backgroundColor: '#ffffff',
          color: '#1f2937',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 20px 45px rgba(15, 23, 42, 0.12)'
        }}
      >
        <h2 className="heading-3" style={{ marginTop: 0, marginBottom: '12px', textAlign: 'center' }}>
          Reactions
        </h2>
        <p className="text-sm" style={{ textAlign: 'center', marginBottom: '24px', color: '#4b5563' }}>
          {totalReactions > 0
            ? `${totalReactions} total reaction${totalReactions === 1 ? '' : 's'} recorded`
            : 'No reactions yet — be the first to respond!'}
        </p>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: '20px'
          }}
        >
          {['red', 'blue'].map(side => (
            <div
              key={side}
              style={{
                flex: '1 1 260px',
                maxWidth: '320px',
                backgroundColor:
                  side === 'red' ? 'rgba(255, 77, 77, 0.08)' : 'rgba(77, 148, 255, 0.08)',
                borderRadius: '12px',
                padding: '16px'
              }}
            >
              <h3
                style={{
                  marginTop: 0,
                  marginBottom: '8px',
                  color: side === 'red' ? '#FF4D4D' : '#4D94FF',
                  textAlign: 'center'
                }}
              >
                {side === 'red' ? 'Red Team' : 'Blue Team'}
              </h3>
              <p className="text-sm" style={{ textAlign: 'center', marginBottom: '16px', color: '#4b5563' }}>
                {reactionTotals[side]} total
              </p>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))',
                  gap: '10px'
                }}
              >
                {reactionEmojiList.map(emoji => (
                  <div
                    key={`${side}-${emoji}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 12px',
                      backgroundColor: 'rgba(255, 255, 255, 0.75)',
                      borderRadius: '10px',
                      fontWeight: 600
                    }}
                  >
                    <span style={{ fontSize: '1.25rem' }}>{emoji}</span>
                    <span style={{ fontSize: '0.9rem' }}>{getReactionCount(side, emoji)}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
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
