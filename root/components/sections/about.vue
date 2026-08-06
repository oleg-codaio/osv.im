<template>
  <section ref="rootRef" :class="$style.root" @mousemove="handleMouseMove" @mouseleave="handleMouseLeave">
    <canvas ref="canvasRef" :class="$style.canvas" />
    <article :class="$style.contents">
      <h1 :class="$style.name">Oleg Vaskevich</h1>
      <p :class="$style.description">
        <strong>I like building systems that are hard to get right.</strong>
      </p>
      <p :class="$style.description">
        Over the past decade, I’ve worked across collaborative products, distributed infrastructure, billing, identity,
        security, and AI tooling—from early product development through large-scale enterprise platforms.
      </p>
    </article>
  </section>
</template>

<script setup lang="ts">
import {ref} from 'vue';

const canvasRef = ref<HTMLCanvasElement | null>(null);
const rootRef = ref<HTMLElement | null>(null);

useParticles(canvasRef);

function handleMouseMove(e: MouseEvent) {
  const container = rootRef.value;
  if (!container) return;
  container.style.setProperty('--mouse-x', `${e.clientX}px`);
  container.style.setProperty('--mouse-y', `${e.clientY}px`);
}

function handleMouseLeave() {
  const container = rootRef.value;
  if (!container) return;
  container.style.setProperty('--mouse-x', '-1000px');
  container.style.setProperty('--mouse-y', '-1000px');
}
</script>

<style lang="scss" module>
@use '~/assets/css/main.scss' as *;

.root {
  position: relative;
  background-color: transparent;
  color: white;
  min-height: 85vh;
  display: flex;
  align-items: center;
  overflow: hidden;
  cursor: default;

  @media only screen and (width <= 768px) {
    min-height: 90vh;
  }
}

.canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  pointer-events: none;
}

.contents {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  justify-content: center;
  max-width: 800px;
  padding: 4rem 2rem;
  margin-left: 5%;

  @media only screen and (width <= 768px) {
    margin-left: 0;
    padding: 3rem 1.5rem;
  }
}

.name {
  font-size: clamp(3.5rem, 8vw, 6rem);
  font-weight: 800;
  letter-spacing: -0.03em;
  line-height: 1.2;
  margin: 0 0 1rem;
  padding-bottom: 0.1em;
  background: linear-gradient(135deg, #fff 30%, #93c5fd 100%);
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.description {
  font-size: clamp(1.05rem, 2.5vw, 1.25rem);
  line-height: 1.7;
  color: var(--text-muted-light, #a1a1aa);
  margin: 0 0 1.5rem;
  max-width: 700px;
  background-image: radial-gradient(
    150px circle at var(--mouse-x, -1000px) var(--mouse-y, -1000px),
    var(--text-main, #fafafa),
    var(--text-muted-light, #a1a1aa) 100%
  );
  background-attachment: fixed;
  background-clip: text;
  transition: color 0.3s;

  &:hover {
    color: transparent;
  }

  a {
    color: var(--primary-accent);
    font-weight: 500;
    border-bottom: 1px dashed rgb(56 189 248 / 40%);
    padding-bottom: 2px;
    transition: all 0.2s ease;

    &:hover {
      color: var(--primary-accent-hover);
      border-bottom-color: var(--primary-accent-hover);
      text-shadow: 0 0 8px rgb(14 165 233 / 40%);
    }
  }
}
</style>
