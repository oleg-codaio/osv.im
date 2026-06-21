<template>
  <section :class="$style.root">
    <canvas ref="canvasRef" :class="$style.canvas" />
    <article :class="$style.contents">
      <h1 :class="$style.name">Oleg Vaskevich</h1>
      <p :class="$style.description">
        I'm a full-stack software engineer who builds robust, high-scale products. My experience is built on solving complex, ambiguous problems, spanning everything from UI and APIs to site reliability, security, and deep LLM integrations.
      </p>
      <p :class="$style.description">
        I bridge the gap between technical execution and business strategy, shipping enterprise platforms that millions rely on.
      </p>
    </article>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const canvasRef = ref<HTMLCanvasElement | null>(null);

useParticles(canvasRef);
</script>

<style lang="scss" module>
@import '~/assets/css/main.scss';

.root {
  position: relative;
  background-color: transparent;
  color: white;
  min-height: 85vh;
  display: flex;
  align-items: center;
  overflow: hidden;
  cursor: default;

  @media only screen and (max-width: 768px) {
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
  max-width: 800px;
  padding: 4rem 2rem;
  margin-left: 5%;

  @media only screen and (max-width: 768px) {
    margin-left: 0;
    padding: 3rem 1.5rem;
  }
}

.name {
  font-size: clamp(3.5rem, 8vw, 6rem);
  font-weight: 800;
  letter-spacing: -0.03em;
  line-height: 1.2;
  margin: 0 0 1rem 0;
  padding-bottom: 0.1em;
  background: linear-gradient(135deg, #ffffff 30%, #93c5fd 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.description {
  font-size: clamp(1.05rem, 2.5vw, 1.25rem);
  line-height: 1.7;
  color: var(--text-muted);
  margin: 0 0 1.5rem 0;
  max-width: 680px;

  a {
    color: var(--primary-accent);
    font-weight: 500;
    border-bottom: 1px dashed rgba(56, 189, 248, 0.4);
    padding-bottom: 2px;
    transition: all 0.2s ease;

    &:hover {
      color: var(--primary-accent-hover);
      border-bottom-color: var(--primary-accent-hover);
      text-shadow: 0 0 8px rgba(14, 165, 233, 0.4);
    }
  }
}
</style>