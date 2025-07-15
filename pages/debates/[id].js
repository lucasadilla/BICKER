import { NextSeo } from 'next-seo';
import NavBar from '../../components/NavBar';

export default function DebateDetail({ debate }) {
  if (!debate) {
    return <div>Debate not found</div>;
  }

  return (
    <div style={{ paddingTop: '70px', fontFamily: 'Arial, sans-serif' }}>
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
      <NavBar />
      <h1 style={{ textAlign: 'center' }}>{debate.instigateText}</h1>
      <p style={{ maxWidth: '600px', margin: '20px auto' }}>{debate.debateText}</p>
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
