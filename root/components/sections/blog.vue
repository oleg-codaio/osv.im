<template>
  <section :class="$style.root">
    <article :class="$style.container">
      <div :class="$style.posts">
        <div v-for="post in posts" :class="$style.postContainer" :key="post.path">
          <div :class="$style.author">
            <div :class="$style.avatar" :style="'background-image: url(' + user.image + ')'" />
            <div :class="$style.metadata">
              <div :class="$style.name">{{ user.name }}</div>
              <div :class="$style.postInfo">
                {{ formatDate(post.date) }}
                &middot;
                {{ post.readTime }} min read
              </div>
            </div>
          </div>
          <NuxtLink :to="post.path" :class="$style.post">
            <div :class="$style.image" :style="'background-image: url(' + post.image + ')'" />
            <h2 :class="$style.title">{{ post.title }}</h2>
            <p :class="$style.subtitle">{{ post.excerpt }}</p>
          </NuxtLink>
        </div>
      </div>
      <div :class="$style.moreLink">
        <a class="invert" href="https://medium.com/@osv" target="_blank" rel="noopener">⇨ archive on medium</a>
      </div>
    </article>
  </section>
</template>

<script setup lang="ts">
import { useAsyncData } from '#app';
import mediumData from '~/assets/data/medium.json';

const { user } = mediumData;

const { data: posts } = await useAsyncData('blog-posts', () => 
  queryCollection('blog')
    .order('date', 'DESC')
    .all()
);

function formatDate(dateStr: string) {
  if (!dateStr) return '';
  const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
  return new Date(dateStr).toLocaleDateString('en-US', options);
}
</script>

<style lang="scss" module>
@import '~/assets/css/main.scss';

$mono-font: 'Fira Code', 'JetBrains Mono', monospace;

.root {
  background: transparent;
}

.container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  max-width: 1100px;
  margin: 0 auto;
  padding: 60px 20px;
  box-sizing: border-box;
}

.posts {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  width: 100%;
  margin-bottom: 30px;

  @media only screen and (max-width: 900px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media only screen and (max-width: 600px) {
    display: flex;
    flex-wrap: nowrap;
    overflow-x: auto;
    gap: 16px;
    padding: 10px 20px;
    margin: 0 -20px 20px -20px;
    -webkit-overflow-scrolling: touch;
    width: calc(100% + 40px);
  }
}

.postContainer {
  background: rgba(22, 27, 34, 0.6);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.2);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-sizing: border-box;

  @media only screen and (max-width: 600px) {
    flex: 0 0 280px;
    max-width: 75vw;
  }

  &:hover {
    transform: translateY(-4px);
    border-color: rgba(255, 255, 255, 0.2);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4), 0 0 15px rgba(59, 130, 246, 0.1);
  }
}

.author {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.avatar {
  height: 40px;
  width: 40px;
  overflow: hidden;
  border-radius: 50%;
  background-size: cover;
  background-position: center;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.metadata {
  margin-left: 12px;
  display: flex;
  flex-direction: column;
}

.name {
  color: #FAFAFA;
  font-size: 0.95rem;
  font-weight: 600;
}

.postInfo {
  font-family: $mono-font;
  color: #8B949E;
  font-size: 0.8rem;
  margin-top: 2px;
}

.post {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  text-decoration: none;
}

.image {
  height: 180px;
  border-radius: 6px;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  filter: grayscale(80%) opacity(0.8);
  transition: filter 0.4s ease, opacity 0.4s ease;
  margin-bottom: 16px;
}

.postContainer:hover .image {
  filter: grayscale(0%) opacity(1);
}

.title {
  color: #FAFAFA;
  font-size: 1.25rem;
  font-weight: 700;
  line-height: 1.4;
  margin: 0 0 8px 0;
  transition: color 0.3s ease;

  .post:hover & {
    color: #60a5fa;
  }
}

.subtitle {
  color: #A1A1AA;
  font-size: 0.95rem;
  line-height: 1.5;
  margin: 0;
}

.moreLink {
  align-self: flex-end;
  margin-top: 10px;
}
</style>
