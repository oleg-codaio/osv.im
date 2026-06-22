<template>
  <div :class="$style.pageWrapper">
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

        <div :class="$style.content">
          <ContentRenderer :value="doc" />
        </div>
      </article>
      <div v-else :class="$style.notFound">
        <p>Post not found.</p>
        <NuxtLink to="/writing" :class="$style.backLink">← Back to Writing</NuxtLink>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import {onMounted, onBeforeUnmount} from 'vue';
import {useAsyncData, useRoute} from '#app';

const route = useRoute();

const {data: doc} = await useAsyncData(`writing-${route.path}`, () =>
  queryCollection('writing').path(route.path).first(),
);

let scrollHandler: any = null;

onMounted(() => {
  scrollHandler = () => {
    if (window.scrollY === 0 && window.location.hash) {
      history.replaceState(history.state, '', window.location.pathname);
    }
  };
  window.addEventListener('scroll', scrollHandler, {passive: true});
});

onBeforeUnmount(() => {
  if (scrollHandler) {
    window.removeEventListener('scroll', scrollHandler);
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

.mainContent {
  max-width: 800px;
  margin: 0 auto;
  padding: 40px 20px 80px;
  box-sizing: border-box;
}

.article {
  max-width: 65ch;
  margin: 0 auto;
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
  font-size: clamp(2rem, 5vw, 3rem);
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

.content {
  font-size: 1.1rem;
  line-height: 1.7;
  color: var(--text-muted-light);

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
    border-left: 4px solid var(--primary-accent);
    margin: 0 0 24px;
    padding-left: 16px;
    color: var(--text-muted-light);
    font-style: italic;
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

  figure {
    margin: 24px 0;
    width: 100%;

    img {
      margin: 0;
    }
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

  .mainContent {
    padding: 0 !important;
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
