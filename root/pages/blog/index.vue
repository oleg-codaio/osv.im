<template>
  <div>
    <h1>Blog Posts</h1>
    <div>
      <div v-for="post of posts" :key="post.slug">
        <NuxtLink :to="{name: 'blog-slug', params: {slug: post.slug}}">
          <img :src="post.image" />
          <div>
            <h2>{{ post.title }}</h2>
            <p>
              {{ post.snippet }}
            </p>
          </div>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {Component, Vue} from 'vue-property-decorator';

@Component({
  async asyncData({$content, params}) {
    const posts = await $content('blog', params.slug).sortBy('createdAt', 'asc').fetch();
    return {posts};
  },
})
export default class Blog extends Vue {}
</script>
