import { NextSeo } from 'next-seo';
import NavBar from '../../components/NavBar';

export default function DeliberateDetail({ deliberation }) {
  if (!deliberation) {
    return <div>Deliberation not found</div>;
  }

  return (
    <div style={{ paddingTop: '70px', fontFamily: 'Arial, sans-serif' }}>
      <NextSeo
        title={`Deliberation: ${deliberation.instigateText}`}
        description={deliberation.debateText}
        canonical={`https://www.yoursite.com/deliberates/${deliberation._id}`}
        openGraph={{
          url: `https://www.yoursite.com/deliberates/${deliberation._id}`,
          title: `Deliberation: ${deliberation.instigateText}`,
          description: deliberation.debateText,
        }}
      />
      <NavBar />
      <h1 style={{ textAlign: 'center' }}>{deliberation.instigateText}</h1>
      <p style={{ maxWidth: '600px', margin: '20px auto' }}>{deliberation.debateText}</p>
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
