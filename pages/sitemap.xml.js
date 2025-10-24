import dbConnect from '../lib/dbConnect';
import Debate from '../models/Debate';
import Deliberate from '../models/Deliberate';

function generateSiteMap(baseUrl, debates, deliberates) {
  const staticUrls = ['', '/debate', '/deliberate', '/instigate', '/leaderboard', '/my-stats'];

  const staticEntries = staticUrls
    .map((path) => `\n  <url>\n    <loc>${baseUrl}${path}</loc>\n  </url>`)
    .join('');

  const entriesById = new Map();
  const registerEntry = (item) => {
    if (!item?._id) {
      return;
    }

    const id = item._id.toString();
    const updatedAt = item.updatedAt instanceof Date
      ? item.updatedAt
      : new Date(item.updatedAt || Date.now());

    const existing = entriesById.get(id);
    if (!existing || updatedAt > existing) {
      entriesById.set(id, updatedAt);
    }
  };

  debates.forEach(registerEntry);
  deliberates.forEach(registerEntry);

  const debateEntries = Array.from(entriesById.entries())
    .map(
      ([id, updatedAt]) =>
        `\n  <url>\n    <loc>${baseUrl}/deliberates/${id}</loc>\n    <lastmod>${updatedAt.toISOString()}</lastmod>\n  </url>`
    )
    .join('');

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${staticEntries}${debateEntries}\n</urlset>`;
}

export async function getServerSideProps({ res, req }) {
  await dbConnect();

  const [debates, deliberates] = await Promise.all([
    Debate.find({}, '_id updatedAt').lean(),
    Deliberate.find({}, '_id updatedAt').lean(),
  ]);

  const protocol = req.headers['x-forwarded-proto'] || 'http';
  const baseUrl = `${protocol}://${req.headers.host}`;
  const sitemap = generateSiteMap(baseUrl, debates, deliberates);

  res.setHeader('Content-Type', 'text/xml');
  res.write(sitemap);
  res.end();

  return { props: {} };
}

export default function Sitemap() {
  return null;
}
