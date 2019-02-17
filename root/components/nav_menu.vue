<template>
  <div>
    <div :class="[$style.hamburger, shown && $style.shown]" v-on:click="shown = !shown">
      <div :class="$style.hamburgerTop"/>
      <div :class="$style.hamburgerMiddle"/>
      <div :class="$style.hamburgerBottom"/>
    </div>

    <scrollactive :offset="isMobile ? 0 : 75" :class="[$style.root, shown && $style.shown]">
      <a
        href="#about"
        class="scrollactive-item"
        :class="$style.item"
        v-on:click="shown = !shown"
      >About</a>
      <a
        href="#experience"
        class="scrollactive-item"
        :class="$style.item"
        v-on:click="shown = !shown"
      >Experience</a>
      <a
        href="#blog"
        class="scrollactive-item"
        :class="$style.item"
        v-on:click="shown = !shown"
      >Blog</a>
      <a
        href="#contact"
        class="scrollactive-item"
        :class="$style.item"
        v-on:click="shown = !shown"
      >Contact</a>
    </scrollactive>
  </div>
</template>

<script lang="ts">
import {Component, Vue} from 'nuxt-property-decorator';

@Component({
  data: () => ({
    shown: false,
    isMobile: (process as any).browser && window.innerWidth < 768,
  }),
})
export default class NavMenu extends Vue {}
</script>

<style lang="scss" module>
@import '../node_modules/sass-svg-uri/_svg-uri';
@import '~/assets/css/main.scss';

@keyframes navMenuBackgroundAnimation {
  0% {
    transform: translateY(48px);
  }
  100% {
    transform: translateY(0);
  }
}

.root {
  align-items: center;
  box-sizing: border-box;
  display: flex;
  font-size: 15pt;
  height: $header-size;
  justify-content: flex-end;
  margin-top: -$header-size;
  padding-right: 25px;
  position: fixed;
  transition: opacity 0.5s ease, mask-size 0.5s ease, mask-position 0.5s ease;
  width: 100%;
  z-index: 10;
  overflow: hidden;
  border-bottom: solid 1px gray;

  &:before {
    animation-direction: repeat;
    animation-duration: 3s;
    animation-iteration-count: infinite;
    animation-name: navMenuBackgroundAnimation;
    background-repeat: round;
    animation-timing-function: linear;
    background-color: $nav-bg-color;
    background-image: svg-uri(
      "<svg width='84' height='48' viewBox='0 0 84 48' xmlns='http://www.w3.org/2000/svg'><path d='M0 0h12v6H0V0zm28 8h12v6H28V8zm14-8h12v6H42V0zm14 0h12v6H56V0zm0 8h12v6H56V8zM42 8h12v6H42V8zm0 16h12v6H42v-6zm14-8h12v6H56v-6zm14 0h12v6H70v-6zm0-16h12v6H70V0zM28 32h12v6H28v-6zM14 16h12v6H14v-6zM0 24h12v6H0v-6zm0 8h12v6H0v-6zm14 0h12v6H14v-6zm14 8h12v6H28v-6zm-14 0h12v6H14v-6zm28 0h12v6H42v-6zm14-8h12v6H56v-6zm0-8h12v6H56v-6zm14 8h12v6H70v-6zm0 8h12v6H70v-6zM14 24h12v6H14v-6zm14-8h12v6H28v-6zM14 8h12v6H14V8zM0 8h12v6H0V8z' fill='#{$nav-accent-color}' fill-opacity='0.3' fill-rule='evenodd'/></svg>"
    );
    bottom: 0;
    content: '';
    left: 0;
    position: absolute;
    right: 0;
    top: -100%;
  }

  @media only screen and (max-width: 768px) {
    pointer-events: none;
    opacity: 0;
    mask-position: 0 0;
    flex-direction: column;
    mask-image: radial-gradient(black, rgba(black, 0.7));
    mask-position: 100% 100%;
    mask-size: 800% 800%;
    padding-top: $header-size;
    padding-bottom: 150px;
    padding-right: 0;
    position: fixed;
    width: 100vw;
    margin-top: 0;
    height: 100vh;

    &.shown {
      opacity: 1;
      pointer-events: all;
      display: flex;
      animation: materialFadeIn 3s forwards;
      mask-position: 70% 50%;
    }

    .item {
      flex: auto;
      display: flex;
      font-size: 40px;
      align-items: center;
    }
  }
}

.hamburger {
  align-content: center;
  background: white;
  border-bottom-left-radius: 15px;
  display: none;
  font-size: 50px;
  height: $header-size;
  overflow: hidden;
  padding-left: 20px;
  padding-right: 20px;
  position: fixed;
  right: 5px;
  text-align: right;
  top: 5px;
  z-index: 15;

  @media only screen and (max-width: 768px) {
    display: block;
    margin-top: 0;
  }
}

.hamburgerTop::before,
.hamburgerMiddle::before,
.hamburgerBottom::before {
  background: gray;
  content: ' ';
  display: block;
  height: 8px;
  margin-top: 12px;
  transition: transform 0.3s ease, opacity 0.3s ease;
  width: 50px;
}

.hamburgerTop::before {
  .shown & {
    transform: rotateZ(-45deg) translate(-16px, 16px);
  }
}

.hamburgerMiddle::before {
  .shown & {
    transform: translateX(75px);
    opacity: 0;
  }
}

.hamburgerBottom::before {
  .shown & {
    transform: rotateZ(45deg) translate(-12px, -12px);
  }
}

.item {
  color: $nav-item-idle;
  transition: color 0.3s ease, opacity 0.3s ease;
  padding-left: 20px;
  padding-right: 20px;
  text-decoration: none;
  z-index: 11;

  &:global(.is-active) {
    color: $nav-item-selected;
  }

  &:hover {
    color: $nav-item-hover;
  }
}
</style>