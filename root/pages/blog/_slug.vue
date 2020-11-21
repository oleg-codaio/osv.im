<template>
  <article :class="$style.root">
    <div :class="$style.masthead">
      <NuxtLink :class="$style.backLink" :to="{name: 'blog'}"><arrow-left-icon /> All posts</NuxtLink>
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
}

.masthead {
  background: black;
  display: flex;
  border-bottom: solid 1px $primary-color;
  padding: 10px;
}

.backLink {
  display: flex;
  align-items: center;
}

.heading {
  display: flex;
  flex-direction: column;
}

.title,
.date,
.content {
  max-width: 50rem;
  margin: 0 auto;
}

.title {
  font-size: 45px;
  margin-bottom: 5px;
}

.date {
  display: flex;
}

.dateIcon {
  margin-right: 5px;
  margin-bottom: 2px;
}

.content {
  padding-top: 20px;
  border-top: solid 2px $primary-color;
  margin: 20px auto 0;
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
