<template>
  <article :class="$style.root">
    <div :class="$style.masthead">
      <NuxtLink :to="{name: 'blog'}"><arrow-left-icon /> All posts</NuxtLink>
    </div>
    <div :class="$style.heading">
      <h1 :class="$style.title">{{ post.title }}</h1>
      <div :class="$style.date">
        <calendar-icon :class="$style.dateIcon" size="20" /> {{ formatDate(post.createdAt) }}
      </div>
    </div>

    <nuxt-content :class="$style.content" :document="post" />
  </article>
</template>

<style lang="scss" module>
@import '~/assets/css/main.scss';
@import url('https://github.githubassets.com/assets/gist-embed-4ac6018bcc05457cde2f66d2e7299d11.css');

.root {
  margin: 10px;
}

.heading {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.title {
  font-size: 35px;
  margin-bottom: 5px;
}

.date {
  display: flex;
  align-items: center;
}

.dateIcon {
  margin-right: 5px;
  margin-bottom: 2px;
}

.content {
  max-width: 50rem;
  margin: 0 auto;
}
</style>

<style lang="scss">
.nuxt-content {
  figure {
    text-align: center;

    img {
      object-fit: contain;
      width: 100%;
    }
  }

  .twitter-tweet {
    margin: 0 auto;
  }
}
</style>

<script type="ts">
import {Component, Vue} from 'vue-property-decorator';
import {CalendarIcon} from 'vue-feather-icons';
import {ArrowLeftIcon} from 'vue-feather-icons';
import {Tweet} from 'vue-tweet-embed';
import Gist from 'vue-embed-gist';

@Component({
  components: {
    ArrowLeftIcon,
    CalendarIcon,
    Gist,
    Tweet,
  },
  methods: {
    formatDate(date) {
      const options = {year: 'numeric', month: 'long', day: 'numeric'};
      return new Date(date).toLocaleDateString('en', options);
    },
  },
  async asyncData({$content, params}) {
    const post = await $content('blog', params.slug).fetch();
    return {post};
  },
})
export default class BlogSlug extends Vue {}
</script>
