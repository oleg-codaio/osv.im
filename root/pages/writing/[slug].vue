<template>
  <div :class="$style.pageWrapper">
    <div :class="$style.articleLayout">
      <main :class="$style.mainContent">
        <article v-if="doc" :class="$style.article">
          <header :class="$style.header">
            <NuxtLink to="/writing" :class="$style.backLink">← Back to Writing</NuxtLink>
            <h1 :class="$style.title">{{ doc.title }}</h1>
            <div :class="$style.meta">
              <span>{{ formatDate(doc.date, 'long') }}</span>
              <span :class="$style.separator">&middot;</span>
              <span>{{ doc.readTime }} min read</span>
            </div>
            <img v-if="doc.image" :src="doc.image" :alt="doc.title" :class="$style.heroImage" />
          </header>

          <div :class="[$style.content, 'content']">
            <ContentRenderer :value="doc" />
          </div>
        </article>
        <div v-else :class="$style.notFound">
          <p>Post not found.</p>
          <NuxtLink to="/writing" :class="$style.backLink">← Back to Writing</NuxtLink>
        </div>
      </main>

      <!-- Table of contents outline sidebar -->
      <aside v-if="flattenedTocLinks.length > 0" :class="$style.tocSidebar">
        <nav :class="$style.tocNav" aria-label="Table of contents">
          <div :class="$style.tocHeader">
            <span :class="$style.tocTitle">Outline</span>
            <button
              :class="[$style.topButton, {[$style.show]: showTopButton}]"
              type="button"
              title="Scroll to top"
              @click="scrollToTop"
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M18 15l-6-6-6 6" />
              </svg>
              Top
            </button>
          </div>
          <ul :class="$style.tocList">
            <li
              v-for="link in flattenedTocLinks"
              :key="link.id"
              :class="[$style.tocItem, $style[`depth${link.depth}`], $style[getTocItemStatus(link.id)]]"
            >
              <a :href="`#${link.id}`" @click.prevent="scrollToHeading(link.id)">
                {{ link.text }}
              </a>
            </li>
          </ul>
        </nav>
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import {ref, computed, onMounted, onBeforeUnmount, nextTick} from 'vue';
import {useAsyncData, useRoute} from '#app';

interface TocLink {
  id: string;
  text: string;
  depth: number;
  children?: TocLink[];
}

const route = useRoute();

const {data: doc} = await useAsyncData(`writing-${route.path}`, () =>
  queryCollection('writing').path(route.path).first(),
);

const siteUrl = 'https://osv.im';

const canonicalUrl = computed(() => `${siteUrl}${route.path}`);
const articleTitle = computed(() => (doc.value?.title ? `${doc.value.title} | Oleg Vaskevich` : 'Oleg Vaskevich'));
const rawTitle = computed(() => doc.value?.title || 'Oleg Vaskevich');
const articleDesc = computed(
  () => doc.value?.excerpt || doc.value?.description || 'Software engineer living and working in Silicon Valley.',
);
const articleImage = computed(() => {
  if (!doc.value?.image) return `${siteUrl}/og-image.jpg`;
  return doc.value.image.startsWith('http') ? doc.value.image : `${siteUrl}${doc.value.image}`;
});
const formattedDate = computed(() => (doc.value?.date ? new Date(doc.value.date).toISOString() : ''));

useSeoMeta({
  title: articleTitle,
  ogTitle: rawTitle,
  description: articleDesc,
  ogDescription: articleDesc,
  ogImage: articleImage,
  ogUrl: canonicalUrl,
  ogType: 'article',
  ogSiteName: 'Oleg Vaskevich',
  twitterCard: 'summary_large_image',
  twitterSite: '@ohleg',
  twitterCreator: '@ohleg',
  twitterTitle: rawTitle,
  twitterDescription: articleDesc,
  twitterImage: articleImage,
  twitterLabel1: 'Written by',
  twitterData1: 'Oleg Vaskevich',
  twitterLabel2: 'Est. reading time',
  twitterData2: () => (doc.value?.readTime ? `${doc.value.readTime} min read` : ''),
});

useHead(() => ({
  link: [
    {rel: 'canonical', href: canonicalUrl.value},
    {
      rel: 'alternate',
      type: 'application/json+oembed',
      href: `${siteUrl}/api/oembed?url=${encodeURIComponent(canonicalUrl.value)}`,
      title: rawTitle.value,
    },
  ],
  script: doc.value
    ? [
        {
          type: 'application/ld+json',
          innerHTML: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BlogPosting',
            headline: doc.value.title,
            description: articleDesc.value,
            image: [articleImage.value],
            datePublished: formattedDate.value,
            author: {
              '@type': 'Person',
              name: 'Oleg Vaskevich',
              url: siteUrl,
            },
            publisher: {
              '@type': 'Person',
              name: 'Oleg Vaskevich',
              url: siteUrl,
            },
            mainEntityOfPage: {
              '@type': 'WebPage',
              '@id': canonicalUrl.value,
            },
          }),
        },
      ]
    : [],
}));

const activeHeadingId = ref<string>('');
const showTopButton = ref(false);
let scrollHandler: (() => void) | null = null;
let observer: IntersectionObserver | null = null;

const tocLinks = computed<TocLink[]>(() => {
  if (!doc.value) return [];
  const body = doc.value.body as Record<string, any>;
  if (body?.toc?.links) return body.toc.links;
  if ((doc.value as Record<string, any>)?.toc?.links) {
    return (doc.value as Record<string, any>).toc.links;
  }
  return [];
});

const allFlatHeadingIds = computed<string[]>(() => {
  const ids: string[] = [];
  for (const h2 of tocLinks.value) {
    if (h2.id) ids.push(h2.id);
    if (h2.children) {
      for (const h3 of h2.children) {
        if (h3.id) ids.push(h3.id);
      }
    }
  }
  return ids;
});

const activeHeadingIndex = computed<number>(() => {
  if (!activeHeadingId.value) return 0;
  const idx = allFlatHeadingIds.value.indexOf(activeHeadingId.value);
  return idx !== -1 ? idx : 0;
});

function getTocItemStatus(id: string): 'active' | 'past' | 'upcoming' {
  if (id === activeHeadingId.value) return 'active';
  const itemIdx = allFlatHeadingIds.value.indexOf(id);
  if (itemIdx === -1) return 'upcoming';
  return itemIdx < activeHeadingIndex.value ? 'past' : 'upcoming';
}

const activeH2Id = computed<string>(() => {
  if (!activeHeadingId.value) {
    return tocLinks.value[0]?.id || '';
  }
  for (const h2 of tocLinks.value) {
    if (h2.id === activeHeadingId.value) {
      return h2.id;
    }
    if (h2.children?.some((child) => child.id === activeHeadingId.value)) {
      return h2.id;
    }
  }
  return tocLinks.value[0]?.id || '';
});

const flattenedTocLinks = computed<TocLink[]>(() => {
  const result: TocLink[] = [];
  for (const h2 of tocLinks.value) {
    result.push({id: h2.id, text: h2.text, depth: h2.depth});
    if (h2.id === activeH2Id.value && h2.children && h2.children.length > 0) {
      for (const h3 of h2.children) {
        result.push({id: h3.id, text: h3.text, depth: h3.depth});
      }
    }
  }
  return result;
});

let isNavigatingViaClick = false;
let navigationTimeout: ReturnType<typeof setTimeout> | null = null;

function scrollToHeading(id: string) {
  const el = document.getElementById(id);
  if (el) {
    isNavigatingViaClick = true;
    activeHeadingId.value = id;
    el.scrollIntoView({behavior: 'smooth', block: 'start'});
    history.replaceState(history.state, '', `#${id}`);

    if (navigationTimeout) clearTimeout(navigationTimeout);
    navigationTimeout = setTimeout(() => {
      isNavigatingViaClick = false;
    }, 800);
  }
}

function scrollToTop() {
  if (!import.meta.client) return;
  isNavigatingViaClick = true;
  activeHeadingId.value = '';
  window.scrollTo({top: 0, behavior: 'smooth'});
  history.replaceState(history.state, '', window.location.pathname);

  if (navigationTimeout) clearTimeout(navigationTimeout);
  navigationTimeout = setTimeout(() => {
    isNavigatingViaClick = false;
  }, 800);
}

function setupIntersectionObserver() {
  if (!import.meta.client) return;

  if (observer) {
    observer.disconnect();
    observer = null;
  }

  const headings = document.querySelectorAll('.content h2[id], .content h3[id]');
  if (!headings.length) return;

  observer = new IntersectionObserver(
    (entries) => {
      if (isNavigatingViaClick) return;
      for (const entry of entries) {
        if (entry.isIntersecting) {
          activeHeadingId.value = entry.target.id;
        }
      }
    },
    {
      rootMargin: '-80px 0px -70% 0px',
      threshold: 0,
    },
  );

  headings.forEach((heading) => observer?.observe(heading));
}

onMounted(() => {
  scrollHandler = () => {
    showTopButton.value = window.scrollY > 300;
    if (window.scrollY === 0 && window.location.hash) {
      history.replaceState(history.state, '', window.location.pathname);
    }
  };
  scrollHandler();
  window.addEventListener('scroll', scrollHandler, {passive: true});

  nextTick(() => {
    setupIntersectionObserver();
  });
});

onBeforeUnmount(() => {
  if (navigationTimeout) {
    clearTimeout(navigationTimeout);
  }
  if (scrollHandler) {
    window.removeEventListener('scroll', scrollHandler);
  }
  if (observer) {
    observer.disconnect();
  }
});
</script>

<style lang="scss" module>
@use '~/assets/css/main.scss' as *;

.pageWrapper {
  background-color: var(--bg-dark-alternate);
  color: var(--text-main);
  min-height: 100vh;
  width: 100vw;
  padding-top: $header-size;
  box-sizing: border-box;
}

.articleLayout {
  display: grid;
  grid-template-columns: minmax(0, 700px);
  gap: 56px;
  width: min(100%, 1040px);
  margin-inline: auto;
  align-items: start;
  padding: 40px 20px 80px;
  box-sizing: border-box;

  @media (width >= 1200px) {
    grid-template-columns: minmax(0, 700px) 230px;
  }
}

.mainContent {
  width: 100%;
  max-width: 700px;
  min-width: 0;
  box-sizing: border-box;
}

.article {
  width: 100%;
}

.header {
  margin-bottom: 40px;
}

.notFound {
  text-align: center;
  padding: 80px 0;
  color: var(--text-muted);
  font-family: 'Fira Code', 'JetBrains Mono', monospace;

  p {
    margin-bottom: 24px;
    font-size: 1.2rem;
    color: var(--text-muted-light);
  }
}

.backLink {
  font-family: monospace;
  color: var(--primary-accent);
  text-decoration: none;
  font-size: 0.9rem;
  display: inline-block;
  margin-bottom: 20px;
  transition: opacity 0.2s ease;

  &:hover {
    opacity: 0.8;
    text-shadow: 0 0 8px rgb(56 189 248 / 40%);
  }
}

.title {
  color: var(--text-main);
  font-size: clamp(2rem, 5vw, 3.2rem);
  font-weight: 800;
  letter-spacing: -0.02em;
  line-height: 1.2;
  margin: 0 0 16px;
}

.meta {
  font-family: 'Fira Code', 'JetBrains Mono', monospace;
  color: var(--text-muted);
  font-size: 0.9rem;
  margin-bottom: 30px;
}

.separator {
  margin: 0 8px;
}

.heroImage {
  width: 100%;
  border-radius: 12px;
  border: 1px solid var(--border-color);
  margin-top: 10px;
  box-shadow: 0 4px 30px rgb(0 0 0 / 30%);
}

.tocSidebar {
  display: none;

  @media (width >= 1200px) {
    display: block;
    width: 230px;
    position: sticky;
    top: 100px;
    align-self: flex-start;
    max-height: calc(100vh - 140px);
    overflow-y: auto;
    padding-left: 16px;
    border-left: 1px solid rgb(255 255 255 / 6%);

    &::-webkit-scrollbar {
      width: 4px;
    }

    &::-webkit-scrollbar-thumb {
      background: rgb(255 255 255 / 15%);
      border-radius: 2px;
    }
  }
}

.tocHeader {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  padding-right: 4px;
}

.tocTitle {
  font-family: 'Fira Code', 'JetBrains Mono', monospace;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: var(--text-muted, #8b949e);
  opacity: 0.5;
  margin-bottom: 0;
}

.topButton {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: transparent;
  border: none;
  font-family: 'Fira Code', 'JetBrains Mono', monospace;
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--text-muted, #8b949e);
  opacity: 0;
  pointer-events: none;
  cursor: pointer;
  padding: 2px 6px;
  border-radius: 4px;
  transition:
    opacity 0.25s ease,
    color 0.2s ease,
    background 0.2s ease;

  &.show {
    opacity: 0.6;
    pointer-events: auto;

    &:hover {
      color: var(--primary-accent, #38bdf8);
      background: rgb(56 189 248 / 10%);
      opacity: 1;

      svg {
        transform: translateY(-1px);
      }
    }
  }

  svg {
    transition: transform 0.2s ease;
  }
}

.tocList {
  list-style: none;
  padding: 0;
  margin: 0;
}

.tocItem {
  margin-bottom: 8px;
  font-size: 0.82rem;
  line-height: 1.5;
  position: relative;

  a {
    color: var(--text-muted, #8b949e);
    text-decoration: none;
    transition:
      color 0.2s ease,
      border-color 0.2s ease,
      opacity 0.2s ease;
    opacity: 0.65;
    display: block;
    padding-left: 8px;
    border-left: 2px solid transparent;

    &:hover {
      color: var(--text-main, #e4e4e7);
      opacity: 0.95;
    }
  }

  &.depth3 {
    margin-left: 12px;
    font-size: 0.78rem;
  }

  &.past {
    a {
      color: var(--text-muted-light, #c9d1d9);
      opacity: 0.85;
    }
  }

  &.upcoming {
    a {
      color: var(--text-muted, #8b949e);
      opacity: 0.45;
    }
  }

  &.active {
    a {
      color: var(--primary-accent, #38bdf8);
      border-left-color: var(--primary-accent, #38bdf8);
      font-weight: 500;
      opacity: 1;
    }
  }
}

.content {
  font-size: 1.1rem;
  line-height: 1.7;
  color: var(--text-muted-light);

  strong,
  b {
    color: var(--text-main, #f0f6fc);
    font-weight: 700;
  }

  // Style HTML elements rendered by ContentRenderer
  p {
    margin-top: 0;
    margin-bottom: 24px;
  }

  p:first-of-type {
    font-size: 1.15em;
    color: var(--text-main);
    font-style: normal;
    font-weight: 400;
    margin-bottom: 2em;
  }

  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    color: var(--text-main);
    letter-spacing: -0.015em;
    margin-top: 40px;
    margin-bottom: 16px;
    font-weight: 700;
    position: relative; // Needed for the absolute-positioned hash anchor
  }

  h1 {
    font-size: 1.8rem;
  }

  h2 {
    font-size: 1.5rem;
  }

  h3 {
    font-size: 1.3rem;
  }

  // Heading anchor links — reset global link styles
  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    a {
      color: inherit;
      text-decoration: none;
      font-weight: inherit;

      // Fading hash indicator on hover
      &::before {
        content: '#';
        position: absolute;
        left: -1.2em;
        color: var(--text-muted);
        opacity: 0;
        font-weight: 400;
        transition: opacity 0.2s ease;
      }
    }

    &:hover a::before {
      opacity: 1;
    }
  }

  // Paragraph & inline links — cyan with subtle faded underline that brightens on hover
  p a,
  li a,
  blockquote a {
    color: var(--primary-accent);
    text-decoration: underline;
    text-decoration-thickness: 1px;
    text-underline-offset: 4px;
    text-decoration-color: rgb(56 189 248 / 40%);
    transition: text-decoration-color 0.2s ease;

    &:hover {
      text-decoration-color: rgb(56 189 248 / 100%);
    }
  }

  ul,
  ol {
    margin-top: 0;
    margin-bottom: 24px;
    padding-left: 24px;
  }

  li {
    margin-bottom: 8px;
  }

  blockquote {
    border-left: 2px solid rgb(56 189 248 / 40%);
    margin: 24px 0;
    padding: 0 0 0 16px;
    font-size: 0.95rem;
    line-height: 1.6;
    color: var(--text-muted-light, #c9d1d9);
    font-style: normal;

    p {
      margin: 0;
      font-size: inherit;
      color: inherit;
    }

    strong,
    b {
      color: var(--text-muted-light, #c9d1d9);
      font-weight: 600;
    }
  }

  details {
    margin: 32px 0;
    padding: 16px 20px;
    background: var(--bg-card, #0d1117);
    border: 1px solid var(--border-color, #30363d);
    border-radius: 12px;
    box-shadow: 0 6px 24px rgb(0 0 0 / 30%);
    transition: border-color 0.2s ease;
    overflow: hidden;

    :global(.breakout) {
      width: 100% !important;
      margin-left: 0 !important;
      max-width: 100% !important;
      border: none !important;
      box-shadow: none !important;
    }

    &[open] {
      border-color: rgb(56 189 248 / 30%);

      summary {
        margin-bottom: 20px;
        border-bottom: 1px solid var(--border-color, #30363d);
        padding-bottom: 14px;
      }
    }

    summary {
      font-family: 'Fira Code', 'JetBrains Mono', monospace;
      font-size: 0.95rem;
      font-weight: 600;
      color: var(--primary-accent, #38bdf8);
      cursor: pointer;
      user-select: none;
      list-style: none;
      display: flex;
      align-items: center;
      gap: 10px;
      outline: none;
      transition: color 0.2s ease;

      &::-webkit-details-marker {
        display: none;
      }

      &::before {
        content: '▶';
        font-size: 0.75rem;
        display: inline-block;
        transition: transform 0.2s ease;
        color: var(--text-muted, #8b949e);
      }

      &:hover {
        color: #7dd3fc;

        &::before {
          color: var(--primary-accent, #38bdf8);
        }
      }
    }

    &[open] summary::before {
      transform: rotate(90deg);
    }
  }

  pre {
    background: var(--bg-card) !important;
    backdrop-filter: blur(8px);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    padding: 16px;
    overflow-x: auto;
    margin-top: 0;
    margin-bottom: 24px;
  }

  code {
    font-family: 'Fira Code', 'JetBrains Mono', monospace;
    font-size: 0.9rem;
    padding: 2px 6px;
    background: rgb(255 255 255 / 5%);
    border-radius: 4px;
    color: #e4e4e7;
  }

  pre code {
    background: transparent;
    padding: 0;
    border-radius: 0;
    color: inherit;
  }

  table {
    width: 100%;
    margin: 32px 0;
    border-collapse: separate;
    border-spacing: 0;
    font-size: 0.78rem;
    line-height: 1.4;
    background: var(--bg-card, #0d1117);
    border: 1px solid var(--border-color, #30363d);
    border-radius: 12px;
    box-shadow: 0 6px 24px rgb(0 0 0 / 30%);
    overflow: hidden;
    box-sizing: border-box;

    th,
    td {
      padding: 8px 10px;
      text-align: left;
      vertical-align: top;
      border-bottom: 1px solid rgb(255 255 255 / 6%);
    }

    td {
      font-size: 0.78rem;
      line-height: 1.4;
      color: var(--text-muted-light, #c9d1d9);

      p {
        font-size: 0.78rem;
        line-height: 1.4;
        margin: 0;
      }
    }

    th {
      font-family: 'Fira Code', 'JetBrains Mono', monospace;
      font-size: 0.68rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--text-muted, #8b949e);
      background: rgb(255 255 255 / 3%);
      border-bottom: 1px solid var(--border-color, #30363d);
      white-space: nowrap;
    }

    tr:nth-child(even) td {
      background: rgb(255 255 255 / 1.5%);
    }

    tr:hover td {
      background: rgb(255 255 255 / 4%);
      transition: background 0.15s ease;
    }

    tbody tr:last-child td {
      border-bottom: none;
    }

    td:first-child {
      font-family: 'Fira Code', 'JetBrains Mono', monospace;
      font-size: 0.76rem;
      font-weight: 600;
    }

    td:nth-child(2) {
      font-weight: 500;
    }

    code {
      font-family: 'Fira Code', 'JetBrains Mono', monospace;
      font-size: 0.74rem;
      padding: 1px 5px;
      background: rgb(255 255 255 / 7%);
      border: 1px solid rgb(255 255 255 / 10%);
      border-radius: 4px;
      color: #e4e4e7;
      display: inline-block;
      vertical-align: top;
      margin-top: -1px;
      white-space: nowrap;
    }
  }

  figure {
    margin: 24px 0;
    width: 100%;

    img {
      margin: 0;
      width: 100%;
    }
  }

  :global(.breakout) {
    margin: 32px 0;
    width: 100%;
    box-sizing: border-box;

    @media (width >= 1250px) {
      width: calc(100% + 180px);
      margin-left: -180px;
      max-width: 900px;
    }

    img {
      width: 100%;
      display: block;
    }
  }

  :global(.katex-display) {
    overflow: auto hidden;
    padding: 8px 0;
    margin: 24px 0;
    max-width: 100%;
  }

  :global(.footnote) {
    font-size: 0.85rem;
    color: #8b949e;
    line-height: 1.6;
    margin: 20px 0;
    opacity: 0.85;
  }

  figcaption {
    font-size: 0.9rem;
    color: #8b949e;
    text-align: center;
    margin-top: 8px;
    margin-bottom: 24px;
  }

  img {
    max-width: 100%;
    border-radius: 8px;
    margin: 16px 0;
  }

  video {
    width: 100%;
    max-width: 100%;
    max-height: 70vh;
    object-fit: contain;
    display: block;
    border-radius: 8px;
    margin: 24px auto;
    border: 1px solid var(--border-color);
    box-shadow: 0 4px 20px rgb(0 0 0 / 25%);
  }
}

@media print {
  :global(body),
  :global(html) {
    background-color: #fff !important;
    background-image: none !important;
    color: #000 !important;
  }

  .pageWrapper {
    background-color: #fff !important;
    color: #000 !important;
    padding-top: 0 !important;
  }

  .articleLayout {
    display: block !important;
    padding: 0 !important;
  }

  .mainContent {
    padding: 0 !important;
  }

  .tocSidebar {
    display: none !important;
  }

  .backLink {
    display: none !important;
  }

  .title {
    color: #000 !important;
  }

  .meta {
    color: #555 !important;
  }

  .content {
    color: #000 !important;

    p {
      color: #000 !important;
    }

    p:first-of-type {
      color: #000 !important;
    }

    h1,
    h2,
    h3,
    h4,
    h5,
    h6 {
      color: #000 !important;
    }

    a {
      color: #06c !important;
      text-decoration: underline !important;
    }

    pre {
      background: #f4f4f5 !important;
      color: #000 !important;
      border: 1px solid #e4e4e7 !important;
      box-shadow: none !important;
    }

    code {
      background: #f4f4f5 !important;
      color: #000 !important;
    }

    blockquote {
      border-left-color: #06c !important;
      color: #333 !important;
      background: #f9f9f9 !important;
    }

    figcaption {
      color: #555 !important;
    }

    :global(.footnote) {
      color: #555 !important;
    }
  }

  .heroImage {
    box-shadow: none !important;
    border: 1px solid #e4e4e7 !important;
  }
}
</style>
