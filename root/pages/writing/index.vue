<template>
  <div :class="$style.pageWrapper">
    <main :class="$style.mainContent">
      <h1 :class="$style.pageTitle">Writing</h1>
      <div :class="$style.posts">
        <WritingCard v-for="post in posts" :key="post.path" :post="post" />
      </div>

      <footer :class="$style.papersFooter">
        <span :class="$style.footerLabel">Academic Archive (2014–2015):</span>
        <span v-for="(paper, index) in papers" :key="paper.url" :class="$style.paperInlineItem">
          <a
            :href="paper.url"
            target="_blank"
            rel="noopener noreferrer"
            :title="paper.fullTitle || paper.title"
            :class="$style.paperLink"
          >
            {{ paper.title }}
          </a>
          <span :class="$style.paperMeta">({{ paper.year }} · {{ paper.meta }})</span>
          <span v-if="index < papers.length - 1" :class="$style.separator">·</span>
        </span>
      </footer>
    </main>
  </div>
</template>

<script setup lang="ts">
import {computed} from 'vue';
import {useAsyncData} from '#app';

interface Paper {
  title: string;
  fullTitle?: string;
  meta: string;
  year: string;
  url: string;
}

const {data: posts} = await useAsyncData('writing-archive', () =>
  queryCollection('writing').order('date', 'DESC').all(),
);

const {data: papersDoc} = await useAsyncData('writing-papers', () => queryCollection('papers').first());

const papers = computed<Paper[]>(() => {
  if (!papersDoc.value) return [];
  const val = (papersDoc.value as Record<string, any>).body ?? papersDoc.value;
  return Array.isArray(val) ? val : [];
});

const canonicalUrl = 'https://osv.im/writing';

useSeoMeta({
  title: 'Writing | Oleg Vaskevich',
  ogTitle: 'Writing | Oleg Vaskevich',
  description: 'Technical articles and writing by Oleg Vaskevich.',
  ogDescription: 'Technical articles and writing by Oleg Vaskevich.',
  ogUrl: canonicalUrl,
  ogType: 'website',
  ogSiteName: 'Oleg Vaskevich',
  twitterCard: 'summary_large_image',
});

useHead({
  link: [{rel: 'canonical', href: canonicalUrl}],
});
</script>

<style lang="scss" module>
@use '~/assets/css/main.scss' as *;

$mono-font: 'Fira Code', 'JetBrains Mono', monospace;

.pageWrapper {
  background-color: #0a0a0c;
  color: #fafafa;
  min-height: 100vh;
  padding-top: calc(#{$header-size} + 40px);
  box-sizing: border-box;
}

.mainContent {
  max-width: 1100px;
  margin: 0 auto;
  padding: 40px 20px;
}

.pageTitle {
  font-size: 2.5rem;
  font-weight: 800;
  margin-top: 0;
  margin-bottom: 40px;
  background: linear-gradient(135deg, #fff 0%, #a1a1aa 100%);
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.posts {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  width: 100%;

  @media only screen and (width <= 900px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media only screen and (width <= 600px) {
    grid-template-columns: 1fr;
  }
}

.papersFooter {
  margin-top: 80px;
  padding-top: 24px;
  border-top: 1px solid rgb(255 255 255 / 6%);
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  font-family: $mono-font;
  font-size: 0.8rem;
  color: #52525b;
}

.footerLabel {
  font-weight: 600;
  color: #71717a;
}

.paperInlineItem {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.paperLink {
  color: #a1a1aa;
  text-decoration: underline;
  text-decoration-color: rgb(161 161 170 / 30%);
  transition: all 0.2s ease;

  &:hover {
    color: #38bdf8;
    text-decoration-color: #38bdf8;
  }
}

.paperMeta {
  color: #52525b;
  font-size: 0.75rem;
}

.separator {
  color: #3f3f46;
  margin-left: 2px;
}
</style>
