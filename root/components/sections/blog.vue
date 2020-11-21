<template>
  <section :class="$style.root">
    <article :class="$style.container">
      <div :class="$style.posts">
        <div v-for="post of posts" :class="$style.postContainer" :key="post.title">
          <div :class="$style.author">
            <div :class="$style.avatar" :style="'background-image: url(' + user.image + ')'" />
            <div :class="$style.metadata">
              <div :class="$style.name">{{ user.name }}</div>
              <div :class="$style.postInfo">
                {{
                  new Date(post.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })
                }}
              </div>
            </div>
          </div>
          <NuxtLink :class="$style.post" :to="{name: 'blog-slug', params: {slug: post.slug}}">
            <div :class="$style.image" :style="'background-image: url(' + post.image + ')'" />
            <h2 :class="$style.title">{{ post.title }}</h2>
            <p :class="$style.subtitle">{{ post.snippet }}</p>
          </NuxtLink>
        </div>
      </div>
      <div :class="$style.moreLink">
        <NuxtLink :class="$style.invert" :to="{name: 'blog'}">All posts</NuxtLink>
      </div>
    </article>
  </section>
</template>

<style lang="scss" module>
@import '~/assets/css/main.scss';

.root {
  background: $color2;
}

.container {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.posts {
  margin: 0 -20px;
  padding: 0 20px;
  display: flex;
  flex-wrap: nowrap;
  overflow-x: auto;
  position: relative;
  -webkit-overflow-scrolling: touch;
}

.postContainer {
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  padding: 10px;
  display: inline-flex;
  flex-direction: column;
  margin: 10px;
  max-width: 75vw;
  background: white;
}

.author {
  display: flex;
  padding: 8px;
}

.avatar {
  height: 50px;
  width: 50px;
  overflow: hidden;
  border-radius: 50px;
  background-size: cover;
}

.metadata {
  margin-left: 10px;
  justify-content: center;
  display: flex;
  flex-direction: column;
}

.postInfo {
  color: darkgray;
}

.post {
  display: flex;
  flex-direction: column;
  height: 330px;
  min-width: 280px;
  background-size: cover;
}

.image {
  flex: auto;
  background-size: cover;
  background-repeat: no-repeat;
}

.title {
  color: black;
}

.subtitle {
  color: gray;
}

.moreLink {
  align-self: flex-end;
  color: $primary-invert-color;
  margin-right: 10px;
}
</style>

<script lang="ts">
import {IContentDocument} from '@nuxt/content/types/content';
import {Component, Prop, Vue} from 'vue-property-decorator';

@Component({
  data: () => ({
    user: {name: 'Oleg Vaskevich', image: require('~/assets/portrait.jpg')},
  }),
})
export default class BlogSection extends Vue {
  @Prop() posts!: IContentDocument[];
}
</script>
