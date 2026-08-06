<template>
  <div :class="[$style.wrapper, 'breakout']">
    <div v-if="error" :class="$style.error">Failed to render diagram: {{ error }}</div>
    <div
      v-else
      :class="[$style.diagramContainer, {[$style.isZoomed]: isZoomed, [$style.isDragging]: isDragging}]"
      @mousedown="onMouseDown"
      @touchstart.passive="onTouchStart"
    >
      <button
        v-if="zoomable"
        type="button"
        :class="$style.zoomButton"
        :aria-label="isZoomed ? 'Reset Zoom' : 'Zoom In'"
        @click.stop="toggleZoom"
      >
        <svg
          v-if="!isZoomed"
          viewBox="0 0 24 24"
          width="14"
          height="14"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
          <line x1="11" y1="8" x2="11" y2="14" />
          <line x1="8" y1="11" x2="14" y2="11" />
        </svg>
        <svg
          v-else
          viewBox="0 0 24 24"
          width="14"
          height="14"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
          <line x1="8" y1="11" x2="14" y2="11" />
        </svg>
        <span>{{ isZoomed ? 'Reset Zoom' : 'Zoom In' }}</span>
      </button>

      <!-- eslint-disable-next-line vue/no-v-html -- Mermaid renders safe client-generated SVG markup -->
      <div ref="containerRef" :class="$style.diagram" :style="diagramStyle" v-html="svgHtml" />
    </div>
  </div>
</template>

<script setup lang="ts">
import {ref, computed, onMounted, onUnmounted, watch, useSlots} from 'vue';

const props = withDefaults(
  defineProps<{
    code?: string;
    zoomFactor?: number;
    zoomable?: boolean;
  }>(),
  {
    code: '',
    zoomFactor: 2,
    zoomable: false,
  },
);

const slots = useSlots();
const containerRef = ref<HTMLElement | null>(null);
const svgHtml = ref<string>('');
const error = ref<string | null>(null);

const isZoomed = ref(false);
const isDragging = ref(false);
const panOffset = ref({x: 0, y: 0});

let mermaidQueue: Promise<unknown> = Promise.resolve();

function enqueueMermaidRender(renderFn: () => Promise<string>): Promise<string> {
  return new Promise((resolve, reject) => {
    mermaidQueue = mermaidQueue
      .then(async () => {
        try {
          const result = await renderFn();
          resolve(result);
        } catch (err) {
          reject(err);
        }
      })
      .catch((err) => {
        reject(err);
      });
  });
}

let dragStart = {x: 0, y: 0};
let initialPan = {x: 0, y: 0};

const diagramStyle = computed(() => {
  if (!isZoomed.value) {
    return {
      transform: 'none',
    };
  }
  const scale = props.zoomFactor || 2;
  return {
    transform: `translate3d(${panOffset.value.x}px, ${panOffset.value.y}px, 0) scale(${scale})`,
    transformOrigin: 'center center',
  };
});

function toggleZoom() {
  isZoomed.value = !isZoomed.value;
  panOffset.value = {x: 0, y: 0};
}

function clampPan(x: number, y: number): {x: number; y: number} {
  if (!containerRef.value) return {x, y};

  const container = containerRef.value.parentElement;
  if (!container) return {x, y};

  const scale = props.zoomFactor || 2;
  const containerRect = container.getBoundingClientRect();
  const diagramRect = containerRef.value.getBoundingClientRect();

  const unscaledWidth = diagramRect.width / scale;
  const unscaledHeight = diagramRect.height / scale;

  const maxPanX = Math.max(0, (unscaledWidth * scale - containerRect.width) / 2);
  const maxPanY = Math.max(0, (unscaledHeight * scale - containerRect.height) / 2);

  return {
    x: Math.min(maxPanX, Math.max(-maxPanX, x)),
    y: Math.min(maxPanY, Math.max(-maxPanY, y)),
  };
}

function onMouseDown(e: MouseEvent) {
  if (!isZoomed.value) return;
  e.preventDefault();
  isDragging.value = true;
  dragStart = {x: e.clientX, y: e.clientY};
  initialPan = {...panOffset.value};

  window.addEventListener('mousemove', onMouseMove);
  window.addEventListener('mouseup', onMouseUp);
}

function onMouseMove(e: MouseEvent) {
  if (!isDragging.value) return;
  const scale = props.zoomFactor || 2;
  const dx = (e.clientX - dragStart.x) / scale;
  const dy = (e.clientY - dragStart.y) / scale;
  panOffset.value = clampPan(initialPan.x + dx, initialPan.y + dy);
}

function onMouseUp() {
  isDragging.value = false;
  window.removeEventListener('mousemove', onMouseMove);
  window.removeEventListener('mouseup', onMouseUp);
}

function onTouchStart(e: TouchEvent) {
  if (!isZoomed.value || e.touches.length !== 1) return;
  const touch = e.touches[0];
  isDragging.value = true;
  dragStart = {x: touch.clientX, y: touch.clientY};
  initialPan = {...panOffset.value};

  window.addEventListener('touchmove', onTouchMove, {passive: false});
  window.addEventListener('touchend', onTouchEnd);
}

function onTouchMove(e: TouchEvent) {
  if (!isDragging.value || e.touches.length !== 1) return;
  e.preventDefault();
  const touch = e.touches[0];
  const scale = props.zoomFactor || 2;
  const dx = (touch.clientX - dragStart.x) / scale;
  const dy = (touch.clientY - dragStart.y) / scale;
  panOffset.value = clampPan(initialPan.x + dx, initialPan.y + dy);
}

function onTouchEnd() {
  isDragging.value = false;
  window.removeEventListener('touchmove', onTouchMove);
  window.removeEventListener('touchend', onTouchEnd);
}

function extractTextFromVNodes(vnodes: any[]): string {
  let text = '';
  for (const node of vnodes) {
    if (typeof node === 'string') {
      text += node;
    } else if (typeof node?.children === 'string') {
      text += node.children;
    } else if (Array.isArray(node?.children)) {
      text += extractTextFromVNodes(node.children);
    }
  }
  return text;
}

let instanceCounter = 0;

async function renderDiagram() {
  if (!import.meta.client) return;

  // Defer rendering if element is inside a collapsed <details> tag
  if (containerRef.value) {
    const parentDetails = containerRef.value.closest('details');
    if (parentDetails && !parentDetails.open) {
      return;
    }
  }

  try {
    let rawCode = props.code || '';
    if (!rawCode && slots.default) {
      rawCode = extractTextFromVNodes(slots.default());
    }

    rawCode = rawCode.trim();
    if (!rawCode) return;

    const mermaidModule = await import('mermaid');
    const mermaid = mermaidModule.default;

    mermaid.initialize({
      startOnLoad: false,
      theme: 'dark',
      themeVariables: {
        darkMode: true,
        background: '#0d1117',
        primaryColor: '#161b22',
        primaryTextColor: '#f0f6fc',
        primaryBorderColor: 'rgba(56, 189, 248, 0.4)',
        lineColor: '#58a6ff',
        secondaryColor: '#161b22',
        tertiaryColor: '#0d1117',
        clusterBkg: 'rgba(255, 255, 255, 0.02)',
        clusterBorder: 'rgba(255, 255, 255, 0.15)',
        fontSize: '14px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        subGraphTitleMargin: {
          top: 15,
          bottom: 15,
        },
      },
      flowchart: {
        useMaxWidth: false,
        htmlLabels: true,
        curve: 'linear',
        nodeSpacing: 50,
        rankSpacing: 65,
        padding: 24,
        subGraphTitleMargin: {
          top: 15,
          bottom: 15,
        },
      },
    });

    let attempts = 0;
    let finalSvg = '';
    const componentId = `mermaid-${Date.now()}-${instanceCounter++}`;

    while (attempts < 3) {
      attempts++;
      const uniqueId = `${componentId}-${attempts}`;

      const rawSvg = await enqueueMermaidRender(async () => {
        const staleDom = document.getElementById(uniqueId) || document.getElementById(`d${uniqueId}`);
        if (staleDom) staleDom.remove();

        const {svg} = await mermaid.render(uniqueId, rawCode);
        return svg;
      });

      const isNotEmpty = !/<g\s*><\/g\s*>/i.test(rawSvg) && /<g[^>]*>[\s\S]+<\/g>/i.test(rawSvg);
      if (isNotEmpty || attempts >= 3) {
        finalSvg = rawSvg;
        break;
      }

      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    if (!finalSvg) return;

    let cleanSvg = finalSvg;
    // Remove height="100%" and inline height/max-width styles that cause Chrome/Safari vertical stretching on scroll
    cleanSvg = cleanSvg.replace(/<svg([^>]+)\bheight="100%"/gi, '<svg$1');
    cleanSvg = cleanSvg.replace(/<svg([^>]+)style="([^"]*)"/gi, (_match, p1, styleContent) => {
      const newStyle = styleContent.replace(/max-width:[^;]+;?/gi, '').replace(/height:[^;]+;?/gi, '');
      return `<svg${p1}style="${newStyle}"`;
    });

    const viewBoxMatch = cleanSvg.match(/viewBox=["']\s*[\d.-]+\s+[\d.-]+\s+([\d.-]+)\s+([\d.-]+)\s*["']/i);
    if (viewBoxMatch) {
      const w = parseFloat(viewBoxMatch[1]);
      const h = parseFloat(viewBoxMatch[2]);
      if (w > 0 && h > 0) {
        cleanSvg = cleanSvg.replace('<svg', `<svg style="aspect-ratio: ${w} / ${h};"`);
      }
    }

    if (!/preserveAspectRatio=/i.test(cleanSvg)) {
      cleanSvg = cleanSvg.replace('<svg', '<svg preserveAspectRatio="xMidYMid meet"');
    }

    svgHtml.value = cleanSvg;
    error.value = null;
  } catch (err) {
    error.value = err instanceof Error ? err.message : String(err);
  }
}

let toggleListener: (() => void) | null = null;
let parentDetailsEl: HTMLDetailsElement | null = null;

onMounted(() => {
  if (containerRef.value) {
    parentDetailsEl = containerRef.value.closest('details');
    if (parentDetailsEl) {
      toggleListener = () => {
        if (parentDetailsEl?.open && !svgHtml.value) {
          nextTick(() => renderDiagram());
        }
      };
      parentDetailsEl.addEventListener('toggle', toggleListener);
      if (!parentDetailsEl.open) {
        return;
      }
    }
  }

  renderDiagram();
});

onUnmounted(() => {
  if (import.meta.client) {
    if (toggleListener && parentDetailsEl) {
      parentDetailsEl.removeEventListener('toggle', toggleListener);
    }
    window.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('mouseup', onMouseUp);
    window.removeEventListener('touchmove', onTouchMove);
    window.removeEventListener('touchend', onTouchEnd);
  }
});

watch(
  () => props.code,
  () => {
    renderDiagram();
  },
);
</script>

<style lang="scss" module>
.wrapper {
  position: relative;
  margin: 32px 0;
  width: 100%;
  transition:
    width 0.2s ease,
    margin 0.2s ease;

  @media (width >= 1250px) {
    width: calc(100% + 180px);
    margin-left: -180px;
    max-width: 900px;
  }
}

.diagramContainer {
  position: relative;
  width: 100%;
  box-sizing: border-box;
  background: var(--bg-card, #0d1117);
  border: 1px solid var(--border-color, #30363d);
  border-radius: 12px;
  box-shadow: 0 6px 24px rgb(0 0 0 / 30%);
  overflow: hidden;
  user-select: none;

  &.isZoomed {
    cursor: grab;

    &.isDragging {
      cursor: grabbing;
    }
  }
}

.zoomButton {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  z-index: 5;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.4rem 0.8rem;
  font-family: inherit;
  font-size: 0.8rem;
  font-weight: 500;
  color: #e2e8f0;
  background: rgb(15 23 42 / 75%);
  border: 1px solid rgb(255 255 255 / 15%);
  border-radius: 6px;
  backdrop-filter: blur(8px);
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    color: #fff;
    background: rgb(30 41 59 / 90%);
    border-color: rgb(255 255 255 / 30%);
  }
}

.diagram {
  width: 100%;
  box-sizing: border-box;
  padding: 28px 32px;
  transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);

  .isDragging & {
    transition: none;
  }

  svg {
    display: block;
    width: 100% !important;
    max-width: 100% !important;
    height: auto !important;
    max-height: none !important;
    margin: 0 auto;
    overflow: visible !important;

    :global(g.node foreignObject) {
      overflow: visible !important;
    }

    :global(g.node foreignObject > div) {
      text-align: center !important;
      box-sizing: border-box !important;
      margin: 0 !important;
      padding: 0 !important;
    }

    :global(span.nodeLabel) {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
      font-size: 14px !important;
      line-height: 1.2 !important;
      text-align: center !important;
      display: inline-block !important;
      white-space: nowrap !important;
      margin: 0 !important;
      padding: 0 !important;
    }

    :global(.cluster-label),
    :global(.cluster-label foreignObject),
    :global(.cluster-label div) {
      overflow: visible !important;
      background: transparent !important;
      border: none !important;
      padding: 0 !important;
      margin: 0 !important;
      box-shadow: none !important;
    }

    :global(.cluster-label span) {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
      font-size: 13px !important;
      font-weight: 600 !important;
      letter-spacing: normal !important;
      color: var(--text-muted, #8b949e) !important;
      white-space: nowrap !important;
      overflow: visible !important;
      padding: 0 !important;
      margin: 0 !important;
    }

    :global(.edgeLabel) {
      background: transparent !important;

      :global(rect) {
        display: none !important;
        opacity: 0 !important;
      }

      :global(foreignObject) {
        overflow: visible !important;
      }

      :global(foreignObject > div),
      :global(div.label),
      :global(p) {
        display: flex !important;
        justify-content: center !important;
        align-items: center !important;
        width: 100% !important;
        height: 100% !important;
        background: transparent !important;
        border: none !important;
        box-shadow: none !important;
        margin: 0 !important;
        padding: 0 !important;
      }

      :global(span) {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
        font-size: 11px !important;
        font-weight: 500 !important;
        letter-spacing: 0.02em !important;
        color: #8b949e !important;
        background: #0d1117 !important;
        padding: 2px 8px !important;
        border: 1px solid rgb(255 255 255 / 10%) !important;
        border-radius: 4px !important;
        box-shadow: 0 2px 6px rgb(0 0 0 / 20%) !important;
        display: inline-block !important;
        white-space: nowrap !important;
        margin: 0 !important;
        line-height: 1.2 !important;
      }
    }

    :global(g.cluster > rect) {
      rx: 10px !important;
      ry: 10px !important;
      stroke: rgb(255 255 255 / 15%) !important;
      stroke-width: 1.5px !important;
      fill: rgb(255 255 255 / 2%) !important;
    }

    :global(g.node > rect),
    :global(g.node > polygon) {
      rx: 8px !important;
      ry: 8px !important;
    }
  }
}

.error {
  padding: 12px 16px;
  font-size: 0.85rem;
  color: #f85149;
  background: rgb(248 81 73 / 10%);
  border: 1px solid rgb(248 81 73 / 40%);
  border-radius: 6px;
  font-family: monospace;
}
</style>
