<template>
  <div :class="[$style.leaf, {[$style.shown]: isShown}]">
    <!-- Node is a decorative timeline dot -->
    <div :class="$style.node">
      <div :class="$style.dot" />
    </div>

    <!-- Info is the unified experience card containing both logo and details -->
    <div :class="$style.info">
      <div :class="$style.cardHeader">
        <div
          :class="$style.logo"
          :style="
            isMounted
              ? {
                  backgroundImage: `url('${experience.icon}')`,
                }
              : {}
          "
        />
        <div :class="$style.headerText">
          <div :class="$style.infoHeader">
            <span :class="$style.infoName">{{ experience.name }}</span>
            <span :class="$style.infoTime">{{ experience.when }}</span>
          </div>
          <div :class="$style.infoTitle">{{ experience.title }}</div>
        </div>
      </div>
      <div :class="$style.infoDetails" v-html="experience.details" />
    </div>
  </div>
</template>

<script setup lang="ts">
interface Experience {
  name: string;
  when: string;
  icon: string;
  title: string;
  details: string;
}

defineProps<{
  experience: Experience;
  isShown: boolean;
  isMounted: boolean;
}>();
</script>

<style lang="scss" module>
@use '~/assets/css/main.scss' as *;

$sans-font:
  'Inter',
  system-ui,
  -apple-system,
  sans-serif;
$mono-font: 'Fira Code', monospace;

.leaf {
  display: flex;
  align-items: center;
  flex-grow: 0;
  padding-top: 5vw;
  padding-bottom: 5vw;
  width: 100%;
  position: relative;
  box-sizing: border-box;

  @media only screen and (width >= 800px) {
    padding-top: 40px;
    padding-bottom: 40px;
  }

  &:nth-child(odd) {
    flex-direction: row-reverse;

    .node {
      left: 92%;
    }

    .info {
      margin-left: 3%;
      margin-right: 13%;
      opacity: 0;
      transform: translateX(-30px);
      transition:
        opacity 0.4s ease,
        transform 0.4s ease;
      will-change: opacity, transform;
    }
  }

  &:nth-child(even) {
    .node {
      left: 8%;
    }

    .info {
      margin-left: 13%;
      margin-right: 3%;
      opacity: 0;
      transform: translateX(30px);
      transition:
        opacity 0.4s ease,
        transform 0.4s ease;
      will-change: opacity, transform;
    }
  }

  &.shown {
    .info {
      opacity: 1;
      transform: translateX(0);
    }

    .dot {
      opacity: 1;
      transform: translate(-50%, -50%) scale(1);
    }
  }

  &:hover {
    .logo {
      transform: scale(1.08);
    }

    .info {
      transform: translateY(-4px);
      border-color: rgb(255 255 255 / 18%);
      box-shadow:
        0 10px 30px rgb(0 0 0 / 40%),
        0 0 15px rgb(56 189 248 / 10%);
    }

    .dot {
      transform: translate(-50%, -50%) scale(1.25);
      border-color: var(--primary-accent, #38bdf8);
      box-shadow: 0 0 15px rgb(56 189 248 / 80%);
    }
  }

  @media only screen and (width <= 768px) {
    $mobilePadding: 5vw;

    &.leaf {
      flex-direction: column;
      max-width: 100% !important;
      width: 100% !important;
      align-items: stretch !important;
      padding-left: $mobilePadding !important;
      padding-right: $mobilePadding !important;

      &:nth-child(odd) {
        text-align: left;
        padding-right: $mobilePadding !important;

        .info {
          margin-left: 0 !important;
          margin-right: 0 !important;
          transform: translateX(-30px);
        }
      }

      &:nth-child(even) {
        .info {
          margin-left: 0 !important;
          margin-right: 0 !important;
          transform: translateX(30px);
        }
      }

      .node {
        display: none;
      }
    }
  }
}

.node {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 0;
  height: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dot {
  width: 12px;
  height: 12px;
  background-color: var(--bg-dark, #09090b);
  border: 3px solid var(--primary-accent, #38bdf8);
  border-radius: 50%;
  position: absolute;
  top: 50%;
  left: 50%;
  opacity: 0;
  transform: translate(-50%, -50%) scale(0);
  box-shadow: 0 0 10px rgb(56 189 248 / 60%);
  transition:
    opacity 0.4s ease,
    transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1),
    border-color 0.3s ease,
    box-shadow 0.3s ease;
}

.info {
  font-family: $sans-font;
  background: var(--bg-card, rgb(22 27 34 / 40%));
  backdrop-filter: blur(8px);
  border: 1px solid var(--border-color, rgb(255 255 255 / 8%));
  border-radius: 12px;
  padding: 20px 24px;
  min-height: 110px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  box-shadow: 0 4px 30px rgb(0 0 0 / 20%);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  width: 100%;
  box-sizing: border-box;
  text-align: left;
}

.cardHeader {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  width: 100%;
}

.logo {
  width: 48px;
  height: 48px;
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  background-color: transparent;
  border-radius: 8px;
  flex-shrink: 0;
  margin-right: 16px;
  padding: 4px;
  box-sizing: border-box;
  transition: transform 0.3s ease;
}

.headerText {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}

.infoDetails {
  font-family: $sans-font;
  color: var(--text-muted, #8b949e);
  font-size: 0.95rem;
  line-height: 1.5;
  margin-top: 6px;
}

.infoHeader {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
}

.infoName {
  font-family: $sans-font;
  font-weight: 700;
  color: var(--text-main, #fafafa);
  font-size: 1.2rem;
}

.infoTitle {
  font-family: $sans-font;
  font-weight: 500;
  color: #c9d1d9;
  font-size: 1rem;
  margin-top: 4px;
}

.infoTime {
  font-family: $mono-font;
  color: var(--text-muted, #8b949e);
  font-size: 0.85rem;
}
</style>
