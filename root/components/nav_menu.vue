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
    background-repeat: round;
    background-color: $nav-bg-color;
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
  height: 50px;
  overflow: hidden;
  padding-left: 15px;
  padding-right: 15px;
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
  height: 5px;
  margin-top: 8px;
  transition: transform 0.3s ease, opacity 0.3s ease;
  width: 30px;
}

.hamburgerTop::before {
  .shown & {
    transform: rotateZ(-45deg) translate(-10px, 10px);
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
    transform: rotateZ(45deg) translate(-8px, -9px);
  }
}

.item {
  color: $nav-item-idle;
  transition: color 0.3s ease, border-color 0.3s ease;
  border: solid 1px transparent;
  border-radius: 20px;
  padding: 10px 20px;
  text-decoration: none;
  z-index: 11;

  @media only screen and (max-width: 768px) {
    margin: 25px 0px;
  }

  &:global(.is-active) {
    color: $nav-item-selected;
    border-color: $nav-item-selected;
  }

  &:hover {
    color: $nav-item-hover;
  }
}
</style>