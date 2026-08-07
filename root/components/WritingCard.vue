<template>
  <NuxtLink :to="post.path" :class="$style.postContainer">
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
    <div :class="$style.post">
      <div :class="$style.image" :style="'background-image: url(' + post.image + ')'" />
      <h2 :class="$style.title">{{ post.title }}</h2>
      <p :class="$style.subtitle">{{ post.description || post.excerpt }}</p>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
interface Post {
  path: string;
  image: string;
  title: string;
  description?: string;
  excerpt?: string;
  date: string;
  readTime: number;
}

interface User {
  name: string;
  image: string;
}

withDefaults(
  defineProps<{
    post: Post;
    user?: User;
  }>(),
  {
    user: () => ({
      name: 'Oleg Vaskevich',
      image: '/images/oleg.jpeg',
    }),
  },
);
</script>

<style lang="scss" module>
@use '~/assets/css/main.scss' as *;

$mono-font: 'Fira Code', 'JetBrains Mono', monospace;

.postContainer {
  background: var(--bg-card, rgb(22 27 34 / 60%));
  backdrop-filter: blur(12px);
  border: 1px solid var(--border-color, rgb(255 255 255 / 8%));
  border-radius: 12px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 30px rgb(0 0 0 / 20%);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-sizing: border-box;
  text-decoration: none;

  &:hover {
    transform: translateY(-4px);
    border-color: rgb(255 255 255 / 20%);
    box-shadow:
      0 10px 30px rgb(0 0 0 / 40%),
      0 0 15px rgb(59 130 246 / 10%);
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
  border: 1px solid rgb(255 255 255 / 10%);
}

.metadata {
  margin-left: 12px;
  display: flex;
  flex-direction: column;
}

.name {
  color: var(--text-main, #fafafa);
  font-size: 0.95rem;
  font-weight: 600;
}

.postInfo {
  font-family: $mono-font;
  color: var(--text-muted, #8b949e);
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
  transition:
    filter 0.4s ease,
    opacity 0.4s ease;
  margin-bottom: 16px;
}

.postContainer:hover .image {
  filter: grayscale(0%) opacity(1);
}

.title {
  color: var(--text-main, #fafafa);
  font-size: 1.25rem;
  font-weight: 700;
  line-height: 1.4;
  margin: 0 0 8px;
  transition: color 0.3s ease;

  .postContainer:hover & {
    color: var(--primary-accent, #38bdf8);
  }
}

.subtitle {
  color: var(--text-muted-light, #a1a1aa);
  font-size: 0.95rem;
  line-height: 1.5;
  margin: 0;
}
</style>
