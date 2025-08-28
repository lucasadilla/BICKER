import fs from 'fs';
import path from 'path';

function generateSiteMap(baseUrl) {
  const staticUrls = ['', '/debate', '/deliberate', '/instigate', '/leaderboard', '/my-stats'];

  const staticEntries = staticUrls
    .map((p) => `\n  <url>\n    <loc>${baseUrl}${p}</loc>\n  </url>`)
    .join('');

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${staticEntries}\n</urlset>`;
}

export async function getStaticProps() {
  const baseUrl = 'https://bicker.ca';
  const sitemap = generateSiteMap(baseUrl);
  const filePath = path.join(process.cwd(), 'public', 'sitemap.xml');
  fs.writeFileSync(filePath, sitemap);
  return { props: {} };
}

export default function Sitemap() {
  return null;
}
