import {defineEventHandler, getQuery, createError} from 'h3';
import {queryCollection} from '#imports';

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const targetUrl = typeof query.url === 'string' ? query.url : '';
  const siteUrl = 'https://osv.im';

  if (!targetUrl) {
    throw createError({statusCode: 400, statusMessage: 'Missing url parameter'});
  }

  let pathname: string;
  try {
    const parsed = new URL(targetUrl, siteUrl);
    pathname = parsed.pathname;
  } catch {
    pathname = targetUrl.startsWith('/') ? targetUrl : `/${targetUrl}`;
  }

  pathname = pathname.replace(/\/index\.html$/, '');

  // Remove trailing slash if present (except root)
  if (pathname.length > 1 && pathname.endsWith('/')) {
    pathname = pathname.slice(0, -1);
  }

  const post = await queryCollection(event, 'writing')
    .path(pathname)
    .select('title', 'description', 'excerpt', 'image')
    .first()
    .catch(() => null);

  if (!post) {
    throw createError({statusCode: 404, statusMessage: 'Post not found'});
  }

  const rawPost = post as any;
  const title = post.title || 'Oleg Vaskevich';
  const description = rawPost.excerpt || rawPost.meta?.excerpt || rawPost.description || '';
  const authorName = 'Oleg Vaskevich';
  const imageUrl = post.image ? (post.image.startsWith('http') ? post.image : `${siteUrl}${post.image}`) : undefined;

  return {
    version: '1.0',
    type: 'link',
    title,
    author_name: authorName,
    author_url: siteUrl,
    provider_name: 'Oleg Vaskevich',
    provider_url: siteUrl,
    description,
    ...(imageUrl ? {thumbnail_url: imageUrl} : {}),
  };
});
