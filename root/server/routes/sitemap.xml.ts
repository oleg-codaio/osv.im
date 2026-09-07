import {defineEventHandler, setResponseHeader} from 'h3';
import {queryCollection} from '#imports';

const siteUrl = 'https://osv.im';

export default defineEventHandler(async (event) => {
  const posts = await queryCollection(event, 'writing').select('path').all();
  const paths = ['/', '/writing', ...posts.map((post) => post.path)];
  const urls = paths.map((path) => `  <url><loc>${new URL(path, siteUrl).href}</loc></url>`).join('\n');

  setResponseHeader(event, 'content-type', 'application/xml; charset=UTF-8');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
});
