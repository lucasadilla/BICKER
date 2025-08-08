import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import NavBar from '../../components/NavBar';

export default function TagPage() {
  const router = useRouter();
  const { tag } = router.query;
  const [instigates, setInstigates] = useState([]);

  useEffect(() => {
    if (tag) {
      fetchByTag(tag);
    }
  }, [tag]);

  const fetchByTag = async (t) => {
    try {
      const res = await fetch(`/api/instigate?tags=${encodeURIComponent(t)}`);
      const instigs = await res.json();
      const withDebates = await Promise.all(
        instigs.map(async (inst) => {
          const resp = await fetch(`/api/debate?instigateId=${inst._id}`);
          const debates = await resp.json();
          return { ...inst, debates: debates || [] };
        })
      );
      setInstigates(withDebates);
    } catch (err) {
      console.error('Error loading tag', err);
    }
  };

  return (
    <div style={{ paddingTop: '70px', fontFamily: 'Arial, sans-serif' }}>
      <NavBar />
      <h1 style={{ textAlign: 'center' }}>Tag: {tag}</h1>
      {instigates.map((inst) => (
        <div
          key={inst._id}
          style={{
            margin: '20px auto',
            maxWidth: '600px',
            padding: '10px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            backgroundColor: '#fff',
          }}
        >
          <h3>{inst.text}</h3>
          <ul>
            {inst.debates.map((debate) => (
              <li key={debate._id}>{debate.debateText}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
