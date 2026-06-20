<template>
  <div :class="$style.pageWrapper">
    <main :class="$style.mainContent">
      <article v-if="doc" :class="$style.article">
        <header :class="$style.header">
          <NuxtLink to="/writing" :class="$style.backLink">← Back to Writing</NuxtLink>
          <h1 :class="$style.title">{{ doc.title }}</h1>
          <div :class="$style.meta">
            <span>{{ formatDate(doc.date) }}</span>
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
import { useAsyncData, useRoute } from '#app';

const route = useRoute();

const { data: doc } = await useAsyncData(`writing-${route.path}`, () => 
  queryCollection('writing').path(route.path).first()
);

function formatDate(dateStr: string) {
  if (!dateStr) return '';
  const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateStr).toLocaleDateString('en-US', options);
}
</script>

<style lang="scss" module>
@import '~/assets/css/main.scss';

.pageWrapper {
  background-color: #0A0A0C;
  color: #FAFAFA;
  min-height: 100vh;
  width: 100vw;
  padding-top: $header-size;
  box-sizing: border-box;
}

.mainContent {
  max-width: 800px;
  margin: 0 auto;
  padding: 40px 20px 80px 20px;
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
  color: #8B949E;
  font-family: 'Fira Code', 'JetBrains Mono', monospace;

  p {
    margin-bottom: 24px;
    font-size: 1.2rem;
    color: #E4E4E7;
  }
}

.backLink {
  font-family: monospace;
  color: #38bdf8;
  text-decoration: none;
  font-size: 0.9rem;
  display: inline-block;
  margin-bottom: 20px;
  transition: opacity 0.2s ease;

  &:hover {
    opacity: 0.8;
    text-shadow: 0 0 8px rgba(56, 189, 248, 0.4);
  }
}

.title {
  color: #FAFAFA;
  font-size: clamp(2rem, 5vw, 3rem);
  font-weight: 800;
  letter-spacing: -0.02em;
  line-height: 1.2;
  margin: 0 0 16px 0;
}

.meta {
  font-family: 'Fira Code', 'JetBrains Mono', monospace;
  color: #8B949E;
  font-size: 0.9rem;
  margin-bottom: 30px;
}

.separator {
  margin: 0 8px;
}

.heroImage {
  width: 100%;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  margin-top: 10px;
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.3);
}

.content {
  font-size: 1.1rem;
  line-height: 1.7;
  color: #E4E4E7; // Paragraphs: Off-white (#E4E4E7)

  // Style HTML elements rendered by ContentRenderer
  p {
    margin-top: 0;
    margin-bottom: 24px;
  }

  h1, h2, h3, h4, h5, h6 {
    color: #FAFAFA; // Headings: Bright white (#FAFAFA)
    letter-spacing: -0.015em;
    margin-top: 40px;
    margin-bottom: 16px;
    font-weight: 700;
  }

  h1 { font-size: 1.8rem; }
  h2 { font-size: 1.5rem; }
  h3 { font-size: 1.3rem; }

  a {
    color: #38bdf8; // Links: primary brand color (#38bdf8)
    text-decoration: underline;
    text-underline-offset: 4px;
    transition: opacity 0.2s ease;

    &:hover {
      opacity: 0.8;
    }
  }

  ul, ol {
    margin-top: 0;
    margin-bottom: 24px;
    padding-left: 24px;
  }

  li {
    margin-bottom: 8px;
  }

  blockquote {
    border-left: 4px solid #38bdf8;
    margin: 0 0 24px 0;
    padding-left: 16px;
    color: #A1A1AA;
    font-style: italic;
  }

  pre {
    background: rgba(22, 27, 34, 0.8) !important; // Deep, dark glassmorphism background
    backdrop-filter: blur(8px);
    border: 1px solid rgba(255, 255, 255, 0.08);
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
    background: rgba(255, 255, 255, 0.05);
    border-radius: 4px;
    color: #e4e4e7;
  }

  pre code {
    background: transparent;
    padding: 0;
    border-radius: 0;
    color: inherit;
  }

  figcaption {
    font-size: 0.9rem;
    color: #8B949E;
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
</style>
