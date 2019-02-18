<template>
  <section :class="$style.root">
    <article :class="$style.container">
      <div :class="$style.posts">
        <!-- <div :class="$style.postsBg"/> -->
        <div v-for="post in posts" :class="$style.postContainer" :key="post.name">
          <div :class="$style.author">
            <div :class="$style.avatar" :style="'background-image: url(' + user.image + ')'"/>
            <div :class="$style.metadata">
              <div :class="$style.name">{{user.name}}</div>
              <div :class="$style.postInfo">
                {{new Date(post.date).toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric'})}}
                &middot;
                {{post.readingTime}} mins
              </div>
            </div>
          </div>
          <a :href="post.url" rel="noreferrer noopener" target="_blank" :class="$style.post">
            <div :class="$style.image" :style="'background-image: url(' + post.image + ')'"/>
            <h2 :class="$style.title">{{post.title}}</h2>
            <p :class="$style.subtitle">{{post.subtitle}}</p>
          </a>
        </div>
      </div>
      <div :class="$style.moreLink">
        <a
          class="invert"
          href="https://medium.com/@osv"
          target="_blank"
          rel="noopener"
        >⇨ medium.com/@osv</a>
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
import {Component, Vue} from 'nuxt-property-decorator';
import {posts, user} from '~/assets/data/medium.json';

@Component({
  data: () => ({
    posts,
    user,
  }),
})
export default class extends Vue {}
</script>
