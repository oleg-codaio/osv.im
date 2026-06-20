<template>
  <div :class="$style.pageWrapper">
    <NavMenu />
    <main :class="$style.mainContent">
      <h1 :class="$style.title">Blog Posts</h1>
      <ul :class="$style.list">
        <li v-for="post of posts" :key="post.path" :class="$style.listItem">
          <NuxtLink :to="post.path" :class="$style.link">
            <h2>{{ post.title }}</h2>
            <p>{{ post.excerpt }}</p>
          </NuxtLink>
        </li>
      </ul>
    </main>
  </div>
</template>

<script setup lang="ts">
import { useAsyncData } from '#app';
const { data: posts } = await useAsyncData('blog-list', () =>
  queryCollection('blog')
    .order('date', 'DESC')
    .all()
);
</script>

<style lang="scss" module>
@import '~/assets/css/main.scss';

.pageWrapper {
  background-color: #0A0A0C;
  color: #FAFAFA;
  min-height: 100vh;
  padding-top: $header-size;
  box-sizing: border-box;
}

.mainContent {
  max-width: 800px;
  margin: 0 auto;
  padding: 40px 20px;
}

.title {
  font-size: 2.5rem;
  font-weight: 800;
  margin-bottom: 30px;
}

.list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.listItem {
  margin-bottom: 24px;
  background: rgba(22, 27, 34, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 20px;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    border-color: rgba(255, 255, 255, 0.15);
  }
}

.link {
  color: inherit;
  text-decoration: none;

  h2 {
    margin: 0 0 10px 0;
    color: #FAFAFA;
  }

  p {
    color: #A1A1AA;
    margin: 0;
  }
}
</style>