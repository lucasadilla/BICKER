import { useState, useEffect } from 'react';
import { NextSeo } from 'next-seo';

export default function DeliberateDetail({ deliberation }) {
  const [votes, setVotes] = useState({
    votesRed: deliberation?.votesRed || 0,
    votesBlue: deliberation?.votesBlue || 0,
  });

  useEffect(() => {
    if (deliberation) {
      setVotes({
        votesRed: deliberation.votesRed || 0,
        votesBlue: deliberation.votesBlue || 0,
      });
    }
  }, [deliberation]);

  useEffect(() => {
    const eventSource = new EventSource('/api/deliberate/live');

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.debateId === deliberation._id) {
          setVotes({
            votesRed: data.votesRed || 0,
            votesBlue: data.votesBlue || 0,
          });
        }
      } catch (err) {
        console.error('Error parsing SSE data:', err);
      }
    };

    return () => {
      eventSource.close();
    };
  }, [deliberation._id]);

  const handleVote = async (vote) => {
    try {
      const response = await fetch('/api/deliberate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ debateId: deliberation._id, vote }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.details || data.error || 'Failed to update votes');
      }

      setVotes({
        votesRed: data.votesRed || 0,
        votesBlue: data.votesBlue || 0,
      });
    } catch (error) {
      console.error('Error voting:', error);
      alert(error.message || 'Failed to submit vote. Please try again.');
    }
  };

  if (!deliberation) {
    return <div>Deliberation not found</div>;
  }

  return (
    <div style={{ paddingTop: '70px' }}>
      <NextSeo
        title={`Deliberation: ${deliberation.instigateText}`}
        description={deliberation.debateText}
        canonical={`https://bicker.ca/deliberates/${deliberation._id}`}
        openGraph={{
          url: `https://bicker.ca/deliberates/${deliberation._id}`,
          title: `Deliberation: ${deliberation.instigateText}`,
          description: deliberation.debateText,
        }}
      />
      <h1 className="heading-1" style={{ textAlign: 'center' }}>{deliberation.instigateText}</h1>
      <p className="text-base" style={{ maxWidth: '600px', margin: '20px auto' }}>{deliberation.debateText}</p>

      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '10px',
          marginTop: '20px',
        }}
      >
        <button
          onClick={() => handleVote('red')}
          style={{
            backgroundColor: '#FF4D4D',
            color: 'white',
            padding: '10px 20px',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
          }}
        >
          Vote Red ({votes.votesRed})
        </button>
        <button
          onClick={() => handleVote('blue')}
          style={{
            backgroundColor: '#4D94FF',
            color: 'white',
            padding: '10px 20px',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
          }}
        >
          Vote Blue ({votes.votesBlue})
        </button>
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
    const deliberation = await res.json();
    return { props: { deliberation } };
  } catch (error) {
    console.error('Failed to load deliberation:', error);
    return { props: { deliberation: null } };
  }
}
