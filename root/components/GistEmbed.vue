<template>
  <div class="gist-embed-container">
    <iframe
      ref="iframeRef"
      :srcdoc="iframeSrcdoc"
      style="width: 100%; border: 0; overflow: hidden; background: transparent; transition: height 0.25s ease;"
      :style="{ height: iframeHeight }"
      scrolling="no"
    ></iframe>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';

const props = defineProps<{
  gistId?: string;
  id?: string;
}>();

const resolvedGistId = computed(() => props.gistId || props.id || '');

const iframeRef = ref<HTMLIFrameElement | null>(null);
const iframeHeight = ref('200px'); // default fallback height

const iframeSrcdoc = computed(() => {
  const id = resolvedGistId.value;
  if (!id) return '';
  
  return `
    <!DOCTYPE html>
    <html data-color-mode="dark" data-dark-theme="dark">
      <head>
        <base target="_blank" />
        <style>
          html, body { 
            margin: 0; 
            padding: 0; 
            background: transparent;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
            overflow-y: hidden; /* Hide iframe's vertical scrollbar */
          }
          
          /* Custom horizontal scrollbar for Gist code */
          ::-webkit-scrollbar {
            height: 6px;
            width: 6px;
          }
          ::-webkit-scrollbar-track {
            background: rgba(0, 0, 0, 0.2);
          }
          ::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.15);
            border-radius: 3px;
          }
          ::-webkit-scrollbar-thumb:hover {
            background: rgba(255, 255, 255, 0.3);
          }

          /* Force dark mode variables even if styling falls back to light-theme classes */
          .gist, .gist .gist-file, [data-color-mode="light"] .gist-file {
            --color-canvas-default: #161b22 !important;
            --color-canvas-subtle: #0d1117 !important;
            --color-border-default: rgba(255, 255, 255, 0.08) !important;
            --color-border-muted: rgba(255, 255, 255, 0.08) !important;
            --color-fg-default: #e4e4e7 !important;
            --color-fg-muted: #8B949E !important;
            --color-neutral-muted: rgba(110, 118, 129, 0.4) !important;
            --color-accent-fg: #38bdf8 !important;
            
            /* Dark syntax highlighting colors */
            --color-prettylights-syntax-comment: #8b949e !important;
            --color-prettylights-syntax-constant: #79c0ff !important;
            --color-prettylights-syntax-entity: #d2a8ff !important;
            --color-prettylights-syntax-storage-modifier-import: #c9d1d9 !important;
            --color-prettylights-syntax-entity-tag: #7ee787 !important;
            --color-prettylights-syntax-keyword: #ff7b72 !important;
            --color-prettylights-syntax-string: #a5d6ff !important;
            --color-prettylights-syntax-variable: #ffa657 !important;
            --color-prettylights-syntax-markup-inserted: #aff5b4 !important;
            --color-prettylights-syntax-markup-deleted: #ffdcd7 !important;
            
            background: #161b22 !important;
            border-color: rgba(255, 255, 255, 0.08) !important;
            color: #e4e4e7 !important;
          }

          /* General overrides for the code container */
          .gist {
            font-size: 0.9rem !important;
          }
          .gist .gist-file {
            border: 1px solid rgba(255, 255, 255, 0.08) !important;
            border-radius: 8px !important;
            background: rgba(22, 27, 34, 0.6) !important;
            backdrop-filter: blur(12px);
            overflow: hidden;
            margin-bottom: 0 !important;
          }
          .gist .gist-data {
            background: transparent !important;
            border-bottom: 1px solid rgba(255, 255, 255, 0.08) !important;
          }
          .gist .gist-meta {
            background: rgba(0, 0, 0, 0.3) !important;
            color: #8B949E !important;
            border-top: 0 !important;
          }
          .gist .gist-meta a {
            color: #38bdf8 !important;
            text-decoration: none !important;
          }
          .gist .gist-meta a:hover {
            text-decoration: underline !important;
          }
          .gist .blob-wrapper {
            background: transparent !important;
            overflow-x: auto !important; /* Ensure horizontal scroll is enabled */
          }
          .gist .blob-num, .gist .blob-code {
            font-family: 'Fira Code', 'JetBrains Mono', monospace !important;
            background: transparent !important;
          }
          .gist .blob-num {
            color: #4b5563 !important;
            border-right: 1px solid rgba(255, 255, 255, 0.05) !important;
          }
          .gist .blob-code-inner {
            color: inherit !important; /* Let highlight variables style variables */
          }
        </style>
      </head>
      <body>
        <script src="https://gist.github.com/oleg-codaio/${id}.js"><\/script>
        <script>
          function sendHeight() {
            // Give it a tiny delay to ensure layout and styles are applied
            setTimeout(() => {
              const height = document.documentElement.scrollHeight || document.body.scrollHeight;
              window.parent.postMessage({ sentinel: 'gist-resize', height: height, id: '${id}' }, '*');
            }, 60);
          }
          
          function forceDarkMode() {
            // Traverse and switch any elements inserted by github script to dark mode
            document.querySelectorAll('.gist-file').forEach(el => {
              el.setAttribute('data-color-mode', 'dark');
              el.setAttribute('data-dark-theme', 'dark');
            });
          }

          window.onload = function() {
            forceDarkMode();
            sendHeight();
          };

          const observer = new MutationObserver(() => {
            forceDarkMode();
            sendHeight();
          });
          observer.observe(document.body, { childList: true, subtree: true });
        <\/script>
      </body>
    </html>
  `;
});

function handleMessage(event: MessageEvent) {
  if (event.data && event.data.sentinel === 'gist-resize' && event.data.id === resolvedGistId.value) {
    if (typeof event.data.height === 'number' && event.data.height > 0) {
      iframeHeight.value = event.data.height + 'px';
    }
  }
}

onMounted(() => {
  window.addEventListener('message', handleMessage);
});

onBeforeUnmount(() => {
  window.removeEventListener('message', handleMessage);
});
</script>

<style lang="scss" scoped>
.gist-embed-container {
  margin: 24px 0;
  width: 100%;
}
</style>
