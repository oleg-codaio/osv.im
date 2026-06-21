<template>
  <div :class="$style.pageWrapper">
    <main :class="$style.mainContent">
      <h1 :class="$style.pageTitle">Writing</h1>
      <div :class="$style.posts">
        <WritingCard v-for="post in posts" :key="post.path" :post="post" :user="user" />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { useAsyncData } from '#app';
import mediumData from '~/assets/data/medium.json';

const { user } = mediumData;

const { data: posts } = await useAsyncData('writing-archive', () =>
  queryCollection('writing')
    .order('date', 'DESC')
    .all()
);


</script>

<style lang="scss" module>
@use '~/assets/css/main.scss' as *;

$mono-font: 'Fira Code', 'JetBrains Mono', monospace;

.pageWrapper {
  background-color: #0A0A0C;
  color: #FAFAFA;
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
  background: linear-gradient(135deg, #ffffff 0%, #a1a1aa 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.posts {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  width: 100%;

  @media only screen and (max-width: 900px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media only screen and (max-width: 600px) {
    grid-template-columns: 1fr;
  }
}

</style>