<template>
  <section :class="$style.root">
    <article :class="$style.container">
      <div :class="$style.posts">
        <WritingCard
          v-for="post in posts?.slice(0, 3)"
          :key="post.path"
          :post="post"
          :user="user"
          :class="$style.postContainer"
        />
      </div>
      <div :class="$style.moreLink">
        <NuxtLink to="/writing" :class="$style.viewAll">
          Read archive <span :class="$style.arrow">→</span>
        </NuxtLink>
      </div>
    </article>
  </section>
</template>

<script setup lang="ts">
import { useAsyncData } from '#app';
import mediumData from '~/assets/data/medium.json';

const { user } = mediumData;

const { data: posts } = await useAsyncData('writing-posts', () => 
  queryCollection('writing')
    .order('date', 'DESC')
    .all()
);


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
  padding: 0 20px;
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
  @media only screen and (max-width: 600px) {
    flex: 0 0 280px;
    max-width: 75vw;
  }
}

.moreLink {
  align-self: flex-end;
  margin-top: 10px;
}

.viewAll {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #38bdf8;
  text-decoration: none;
  font-family: $mono-font;
  font-weight: 500;
  font-size: 0.95rem;
  transition: color 0.3s ease;

  &:hover {
    color: #0ea5e9;

    .arrow {
      transform: translateX(4px);
    }
  }
}

.arrow {
  display: inline-block;
  transition: transform 0.3s ease;
}
</style>
