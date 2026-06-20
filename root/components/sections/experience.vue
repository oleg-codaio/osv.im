<template>
  <section :class="$style.root">
    <article :class="$style.contents">
      <div :class="$style.timeline" :style="{maxWidth: maxSvgWidthPx + 'px'}">
        <svg
          :class="$style.svg"
          preserveAspectRatio="none"
          :viewBox="`0 0 ${pathWidth} ${pathHeight}`"
          ref="svg"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="progressGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stop-color="#1e3a8a" />
              <stop offset="50%" stop-color="#3b82f6" />
              <stop offset="100%" stop-color="#06b6d4" />
            </linearGradient>
          </defs>
          <!-- Layer 1: Static Faint Track -->
          <path
            :class="$style.pathTrack"
            fill="none"
            stroke="rgba(255, 255, 255, 0.05)"
            stroke-linejoin="round"
            stroke-linecap="round"
            :stroke-width="strokeWidth"
            :d="pathData"
          />
          <!-- Layer 2: Scroll-Synced Progress -->
          <path
            :class="$style.pathProgress"
            ref="pathRef"
            fill="none"
            stroke="url(#progressGradient)"
            stroke-linejoin="round"
            stroke-linecap="round"
            :stroke-width="strokeWidth"
            :d="pathData"
          />
          <!-- Layer 3: Animated Data Flow -->
          <path
            :class="$style.pathDataFlow"
            fill="none"
            stroke="#3b82f6"
            stroke-linejoin="round"
            stroke-linecap="round"
            :stroke-width="strokeWidth"
            stroke-dasharray="10 400"
            :d="pathData"
          />
          <!-- Receptor Node -->
          <circle
            :cx="pathWidth / 2"
            cy="0"
            r="5"
            fill="#38bdf8"
            :style="{ filter: 'drop-shadow(0 0 8px rgba(56, 189, 248, 0.9))' }"
          />
        </svg>
        <div :class="$style.leaves" ref="leavesRef">
          <div
            :class="[$style.leaf, { [$style.shown]: numShown > index }]"
            v-for="(exp, index) in experiences"
            :key="exp.name + exp.when"
          >
            <!-- Node is now just a decorative timeline dot -->
            <div :class="$style.node">
              <div :class="$style.dot" />
            </div>
            
            <!-- Info is the unified experience card containing both logo and details -->
            <div :class="$style.info">
              <div :class="$style.cardHeader">
                <div
                  :class="$style.logo"
                  :style="{
                    backgroundImage: `url('${exp.icon}')`,
                  }"
                />
                <div :class="$style.headerText">
                  <div :class="$style.infoHeader">
                    <span :class="$style.infoName">{{ exp.name }}</span>
                    <span :class="$style.infoTime">{{ exp.when }}</span>
                  </div>
                  <div :class="$style.infoTitle">{{ exp.title }}</div>
                </div>
              </div>
              <div :class="$style.infoDetails" v-html="exp.details" />
            </div>
          </div>
        </div>
      </div>
    </article>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, nextTick, useCssModule } from 'vue';
import superhumanIcon from '~/assets/experience/superhuman.png';
import grammarlyIcon from '~/assets/experience/grammarly.png';
import codaIcon from '~/assets/experience/coda.png';
import northeasternIcon from '~/assets/experience/northeastern.png';
import googleNewIcon from '~/assets/experience/google-new.png';
import kpfellowsIcon from '~/assets/experience/kpfellows.png';
import shapeIcon from '~/assets/experience/shape.png';
import googleIcon from '~/assets/experience/google.png';
import twitterIcon from '~/assets/experience/twitter.png';
import nullientIcon from '~/assets/experience/nullient.png';

const pathData = ref('');
const pathHeight = ref(0);
const pathWidth = ref(0);
const strokeWidth = ref(1);
const maxSvgWidthPx = 800;

const svg = ref<SVGSVGElement | null>(null);
const pathRef = ref<SVGPathElement | null>(null);
const leavesRef = ref<HTMLDivElement | null>(null);

const style = useCssModule();

// Rendered during animation frame.
let animationFrameRequested = false;
let appliedStrokeDashOffset = 0;
const numShown = ref(0);

function generateDynamicPath(
  centers: number[],
  heights: number[],
  totalHeight: number,
  totalWidth: number,
  leftLine: number,
  rightLine: number,
  curveSize: number
): string {
  if (centers.length === 0) return '';
  
  const midX = totalWidth / 2;
  let path = `M ${midX} 0`;
  
  // Transition to the first card's line (above Card 0 top)
  const firstCenter = centers[0];
  const firstHeight = heights[0];
  const topClearanceY = firstCenter - firstHeight / 2 - 30; // 30px clearance above Card 0
  
  path += `
    L ${midX} ${topClearanceY - curveSize}
    Q ${midX} ${topClearanceY}, ${midX + curveSize} ${topClearanceY}
    L ${rightLine - curveSize} ${topClearanceY}
    Q ${rightLine} ${topClearanceY}, ${rightLine} ${topClearanceY + curveSize}
    L ${rightLine} ${firstCenter}
  `;
  
  // Transition between cards (snaking in the gaps)
  for (let i = 0; i < centers.length - 1; i++) {
    const currentY = centers[i];
    const nextY = centers[i + 1];
    
    const currentBottom = currentY + heights[i] / 2;
    const nextTop = nextY - heights[i + 1] / 2;
    const midY = (currentBottom + nextTop) / 2;
    
    const currentX = (i % 2 === 0) ? rightLine : leftLine;
    const nextX = (i % 2 === 0) ? leftLine : rightLine;
    
    const currentDx = (i % 2 === 0) ? -curveSize : curveSize;
    const nextDx = (i % 2 === 0) ? curveSize : -curveSize;
    
    path += `
      L ${currentX} ${midY - curveSize}
      Q ${currentX} ${midY}, ${currentX + currentDx} ${midY}
      L ${nextX + nextDx} ${midY}
      Q ${nextX} ${midY}, ${nextX} ${midY + curveSize}
      L ${nextX} ${nextY}
    `;
  }
  
  // Transition from last card to bottom center (below Card N-1 bottom)
  const lastIndex = centers.length - 1;
  const lastY = centers[lastIndex];
  const lastHeight = heights[lastIndex];
  const bottomClearanceY = lastY + lastHeight / 2 + 30; // 30px clearance below Card N-1
  
  const lastX = (lastIndex % 2 === 0) ? rightLine : leftLine;
  const lastDx = (lastIndex % 2 === 0) ? -curveSize : curveSize;
  
  path += `
    L ${lastX} ${bottomClearanceY - curveSize}
    Q ${lastX} ${bottomClearanceY}, ${lastX + lastDx} ${bottomClearanceY}
    L ${midX - lastDx} ${bottomClearanceY}
    Q ${midX} ${bottomClearanceY}, ${midX} ${bottomClearanceY + curveSize}
    L ${midX} ${totalHeight}
  `;
  
  return path;
}

function getPathAndLength() {
  const path = pathRef.value;
  if (!path) return { path: null, rect: null, len: 0 };
  const rect = path.getBoundingClientRect();
  const len = path.getTotalLength();
  return { path, rect, len };
}

function handleResize() {
  nextTick(() => {
    const leavesContainer = leavesRef.value;
    if (!leavesContainer) return;

    const timeline = svg.value?.parentElement;
    if (!timeline) return;

    const timelineRect = timeline.getBoundingClientRect();
    const leafElements = leavesContainer.querySelectorAll('.' + style.leaf);

    const centers: number[] = [];
    const heights: number[] = [];
    leafElements.forEach((leaf) => {
      const rect = leaf.getBoundingClientRect();
      const center = rect.top - timelineRect.top + rect.height / 2;
      centers.push(center);
      heights.push(rect.height);
    });

    const totalWidth = timelineRect.width;
    const totalHeight = timelineRect.height;
    
    pathHeight.value = totalHeight;
    pathWidth.value = totalWidth;

    const leftLine = totalWidth * 0.08;
    const rightLine = totalWidth * 0.92;
    const curveSize = 30;

    pathData.value = generateDynamicPath(centers, heights, totalHeight, totalWidth, leftLine, rightLine, curveSize);
    strokeWidth.value = 5;

    nextTick(() => {
      const { path, len } = getPathAndLength();
      if (!path) return;
      path.style.strokeDasharray = `${len}`;
      handleScroll();

      // Dispatch anchor coordinate update
      const svgRect = svg.value?.getBoundingClientRect();
      if (svgRect) {
        window.dispatchEvent(new CustomEvent('timeline-anchor-updated', {
          detail: {
            x: svgRect.left + svgRect.width / 2,
            y: svgRect.top,
          }
        }));
      }
    });
  });
}

function paint(): void {
  animationFrameRequested = false;
  const { path } = getPathAndLength();
  if (!path) return;

  path.style.strokeDashoffset = `${appliedStrokeDashOffset}`;
}

function handleScroll() {
  const { rect, len } = getPathAndLength();
  if (!rect) return;

  const offsetPx = window.innerHeight / 2.5;
  const offsetTop = rect.top + window.scrollY - window.innerHeight + offsetPx;
  const visible = Math.max(0, Math.min(1, (window.scrollY - offsetTop) / rect.height));

  appliedStrokeDashOffset = len * (1 - visible);
  numShown.value = Math.floor(visible * experiences.value.length + 5 / 11);

  if (!animationFrameRequested) {
    animationFrameRequested = true;
    requestAnimationFrame(paint);
  }
}

onMounted(() => {
  handleResize();
  window.addEventListener('resize', handleResize);
  window.addEventListener('scroll', handleScroll);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize);
  window.removeEventListener('scroll', handleScroll);
});

const experiences = ref([
  {
    name: 'Superhuman',
    when: 'Feb 2026 — Present',
    icon: superhumanIcon,
    title: 'Engineering Manager / Technical Lead',
    details: 'Directing cross-product platform architecture and enterprise integrations to power the unified Superhuman bundle.',
  },
  {
    name: 'Grammarly',
    when: 'Jan 2025 — Jan 2026',
    icon: grammarlyIcon,
    title: 'Technical Lead, Cross-Product Services',
    details: 'Architected the backend backbone of the Superhuman bundle—unifying identity, enterprise billing, and seamless migration flows across Coda, Grammarly, Mail, and Go.',
  },
  {
    name: 'Coda',
    when: 'Aug 2020 — Dec 2024',
    icon: codaIcon,
    title: 'Tech Lead, Monetization, Enterprise, & AI Platform',
    details: 'Scaled the platform from pre-revenue to millions of users, engineering the core billing engine, the enterprise product suite, and the foundational RAG infrastructure behind Coda Brain.',
  },
  {
    name: 'Coda',
    when: 'June 2016 — July 2020',
    icon: codaIcon,
    title: 'Software Engineer, Core Product, Foundation, & Packs',
    details: 'Built foundational product architecture, established the sandboxed Packs plugin ecosystem, and drove early operational rigor across security, DevOps, and the 24/7 SRE rotation.',
  },
  {
    name: 'Northeastern University',
    when: 'Sept 2011 — May 2016',
    icon: northeasternIcon,
    title: 'BS in Computer Engineering, Minors in Computer Science and Music Performance',
    details: '<i>summa cum laude</i>, Tau Beta Pi, Eta Kappa Nu, Beta Theta Pi',
  },
  {
    name: 'Google',
    when: 'Fall 2015',
    icon: googleNewIcon,
    title: 'Software Engineering Intern, Security',
    details: 'Developed system for automated vulnerability detection',
  },
  {
    name: 'KP Fellows',
    when: 'Summer 2015',
    icon: kpfellowsIcon,
    title: 'Kleiner Perkins Engineering Fellow',
    details: 'Selected from over 2,500 applicants',
  },
  {
    name: 'Shape Security',
    when: 'Summer 2015',
    icon: shapeIcon,
    title: 'Software Engineering Intern',
    details: 'Worked on botwall platform, map-reduce data processing, and visualization',
  },
  {
    name: 'Google',
    when: 'Summer - Fall 2014',
    icon: googleIcon,
    title: 'Software Engineering Intern, Search Infrastructure',
    details: 'Worked on on Google Web Server',
  },
  {
    name: 'Twitter',
    when: 'Summer - Fall 2013',
    icon: twitterIcon,
    title: 'Software Engineering Intern, Crashlytics',
    details: 'Automated mobile app crash reporting and beta testing (Twitter Fabric / Google Firebase)',
  },
  {
    name: 'Nullient',
    when: 'June 2011 — May 2016',
    icon: nullientIcon,
    title: 'Owner',
    details: 'Developed mobile apps totalling 85k+ downloads on Google Play Store',
  },
]);
</script>

<style lang="scss" module>
@import 'sass-svg-uri';
@import '~/assets/css/main.scss';
@import url('https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500;700&family=Inter:wght@400;500;600;700&display=swap');

$sans-font: 'Inter', system-ui, -apple-system, sans-serif;
$mono-font: 'Fira Code', monospace;
$pathWidth: 4px;

.root {
  background-color: transparent;
  background-image: svg-uri(
    "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 304 304' width='304' height='304'><path fill='#{$experience-background-accent-color}' fill-opacity='0.4' d='M44.1 224a5 5 0 1 1 0 2H0v-2h44.1zm160 48a5 5 0 1 1 0 2H82v-2h122.1zm57.8-46a5 5 0 1 1 0-2H304v2h-42.1zm0 16a5 5 0 1 1 0-2H304v2h-42.1zm6.2-114a5 5 0 1 1 0 2h-86.2a5 5 0 1 1 0-2h86.2zm-256-48a5 5 0 1 1 0 2H0v-2h12.1zm185.8 34a5 5 0 1 1 0-2h86.2a5 5 0 1 1 0 2h-86.2zM258 12.1a5 5 0 1 1-2 0V0h2v12.1zm-64 208a5 5 0 1 1-2 0v-54.2a5 5 0 1 1 2 0v54.2zm48-198.2V80h62v2h-64V21.9a5 5 0 1 1 2 0zm16 16V64h46v2h-48V37.9a5 5 0 1 1 2 0zm-128 96V208h16v12.1a5 5 0 1 1-2 0V210h-16v-76.1a5 5 0 1 1 2 0zm-5.9-21.9a5 5 0 1 1 0 2H114v48H85.9a5 5 0 1 1 0-2H112v-48h12.1zm-6.2 130a5 5 0 1 1 0-2H176v-74.1a5 5 0 1 1 2 0V242h-60.1zm-16-64a5 5 0 1 1 0-2H114v48h10.1a5 5 0 1 1 0 2H112v-48h-10.1zM66 284.1a5 5 0 1 1-2 0V274H50v30h-2v-32h18v12.1zM236.1 176a5 5 0 1 1 0 2H226v94h48v32h-2v-30h-48v-98h12.1zm25.8-30a5 5 0 1 1 0-2H274v44.1a5 5 0 1 1-2 0V146h-10.1zm-64 96a5 5 0 1 1 0-2H208v-80h16v-14h-42.1a5 5 0 1 1 0-2H226v18h-16v80h-12.1zm86.2-210a5 5 0 1 1 0 2H272V0h2v32h10.1zM98 101.9V146H53.9a5 5 0 1 1 0-2H96v-42.1a5 5 0 1 1 2 0zM53.9 34a5 5 0 1 1 0-2H80V0h2v34H53.9zm60.1 3.9V66H82v64H69.9a5 5 0 1 1 0-2H80V64h32V37.9a5 5 0 1 1 2 0zM101.9 82a5 5 0 1 1 0-2H128V37.9a5 5 0 1 1 2 0V82h-28.1zm16-64a5 5 0 1 1 0-2H146v44.1a5 5 0 1 1-2 0V18h-26.1zm102.2 270a5 5 0 1 1 0 2H98v14h-2v-16h124.1zM242 149.9V160h16v34h-16v62h48v48h-2v-46h-48v-66h16v-30h-16v-12.1a5 5 0 1 1 2 0zM53.9 18a5 5 0 1 1 0-2H64V2H48V0h18v18H53.9zm112 32a5 5 0 1 1 0-2H192V0h50v2h-48v48h-28.1zm-48-48a5 5 0 0 1-9.8-2h2.07a3 3 0 1 0 5.66 0H178v34h-18V21.9a5 5 0 1 1 2 0V32h14V2h-58.1zm0 96a5 5 0 1 1 0-2H137l32-32h39V21.9a5 5 0 1 1 2 0V66h-40.17l-32 32H117.9zm28.1 90.1a5 5 0 1 1-2 0v-76.51L175.59 80H224V21.9a5 5 0 1 1 2 0V82h-49.59L146 112.41v75.69zm16 32a5 5 0 1 1-2 0v-99.51L184.59 96H300.1a5 5 0 0 1 3.9-3.9v2.07a3 3 0 0 0 0 5.66v2.07a5 5 0 0 1-3.9-3.9H185.41L162 121.41v98.69zm-144-64a5 5 0 1 1-2 0v-3.51l48-48V48h32V0h2v50H66v55.41l-48 48v2.69zM50 53.9v43.51l-48 48V208h26.1a5 5 0 1 1 0 2H0v-65.41l48-48V53.9a5 5 0 1 1 2 0zm-16 16V89.41l-34 34v-2.82l32-32V69.9a5 5 0 1 1 2 0zM12.1 32a5 5 0 1 1 0 2H9.41L0 43.41V40.6L8.59 32h3.51zm265.8 18a5 5 0 1 1 0-2h18.69l7.41-7.41v2.82L297.41 50H277.9zm-16 160a5 5 0 1 1 0-2H288v-71.41l16-16v2.82l-14 14V210h-28.1zm-208 32a5 5 0 1 1 0-2H64v-22.59L40.59 194H21.9a5 5 0 1 1 0-2H41.41L66 216.59V242H53.9zm150.2 14a5 5 0 1 1 0 2H96v-56.6L56.6 162H37.9a5 5 0 1 1 0-2h19.5L98 200.6V256h106.1zm-150.2 2a5 5 0 1 1 0-2H80v-46.59L48.59 178H21.9a5 5 0 1 1 0-2H49.41L82 208.59V258H53.9zM34 39.8v1.61L9.41 66H0v-2h8.59L32 40.59V0h2v39.8zM2 300.1a5 5 0 0 1 3.9 3.9H3.83A3 3 0 0 0 0 302.17V256h18v48h-2v-46H2v42.1zM34 241v63h-2v-62H0v-2h34v1zM17 18H0v-2h16V0h2v18h-1zm273-2h14v2h-16V0h2v16zm-32 273v15h-2v-14h-14v14h-2v-16h18v1zM0 92.1A5.02 5.02 0 0 1 6 97a5 5 0 0 1-6 4.9v-2.07a3 3 0 1 0 0-5.66V92.1zM80 272h2v32h-2v-32zm37.9 32h-2.07a3 3 0 0 0-5.66 0h-2.07a5 5 0 0 1 9.8 0zM5.9 0A5.02 5.02 0 0 1 0 5.9V3.83A3 3 0 0 0 3.83 0H5.9zm294.2 0h2.07A3 3 0 0 0 304 3.83V5.9a5 5 0 0 1-3.9-5.9zm3.9 300.1v2.07a3 3 0 0 0-1.83 1.83h-2.07a5 5 0 0 1 3.9-3.9zM97 100a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0-16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm16 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm16 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-48 32a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm16 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm32 48a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-16 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm32-16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0-32a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm16 32a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm32 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0-16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-16-64a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm16 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm16 96a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm16 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm16-144a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0 32a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm16-32a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm16-16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-96 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm16-32a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm96 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-16-64a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm16-16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-32 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0-16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-16 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-16 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-16 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-16 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM49 36a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-32 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm32 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM33 68a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm16-48a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0 240a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm16 32a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-16-64a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-16-32a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm80-176a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm16 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-16-16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm32 48a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm16-16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0-32a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm112 176a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-16 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM17 180a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0-32a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm16 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM17 84a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm32 64a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm16-16a3 3 0 1 0 0-6 3 3 0 0 0 0 6z'/></svg>"
  );
}

.timeline {
  min-height: 100vh;
  max-width: var(--max-svg-width);
  margin-left: auto;
  margin-right: auto;
  display: flex;
  flex-direction: column;
  overflow: visible;
  position: relative;
  cursor: default;
}

.svg {
  pointer-events: none;
  position: absolute;
  left: 0;
  right: 0;
  width: 100%;
  overflow: hidden;
  height: 100%;
  top: 0;
  bottom: 0;
  -webkit-mask-image: linear-gradient(to bottom, black 90%, transparent 100%);
  mask-image: linear-gradient(to bottom, black 90%, transparent 100%);
}

.pathTrack {
  transition: stroke-width 0.3s;
}

.pathProgress {
  transition: stroke-width 0.3s;
  filter: drop-shadow(0 0 3px rgba(37, 99, 235, 0.5)) drop-shadow(0 0 6px rgba(6, 182, 212, 0.3));
}

.pathDataFlow {
  transition: stroke-width 0.3s;
  opacity: 0.15;
  animation: dataFlowAnim 60s linear infinite;
}

@keyframes dataFlowAnim {
  to {
    stroke-dashoffset: -1000;
  }
}

.leaves {
  width: 100%;
  overflow: visible;
  display: flex;
  flex-direction: column;
  padding-top: 60px;
  padding-bottom: 60px;
  box-sizing: border-box;
}

.leaf {
  display: flex;
  align-items: center;
  flex-grow: 0;
  padding-top: 5vw;
  padding-bottom: 5vw;
  width: 100%;
  position: relative;
  box-sizing: border-box;

  @media only screen and (min-width: 800px) {
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
      transition: opacity 0.4s ease, transform 0.4s ease;
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
      transition: opacity 0.4s ease, transform 0.4s ease;
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
      border-color: rgba(255, 255, 255, 0.18);
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4), 0 0 15px rgba(59, 130, 246, 0.1);
    }
    
    .dot {
      transform: translate(-50%, -50%) scale(1.25);
      border-color: #06b6d4;
      box-shadow: 0 0 15px rgba(6, 182, 212, 0.8);
    }
  }

  @media only screen and (max-width: 768px) {
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
  background-color: #09090B;
  border: 3px solid #3b82f6;
  border-radius: 50%;
  position: absolute;
  top: 50%;
  left: 50%;
  opacity: 0;
  transform: translate(-50%, -50%) scale(0);
  box-shadow: 0 0 10px rgba(59, 130, 246, 0.6);
  transition: opacity 0.4s ease, transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), border-color 0.3s ease, box-shadow 0.3s ease;
}

.info {
  font-family: $sans-font;
  background: rgba(22, 27, 34, 0.4);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 20px 24px;
  min-height: 110px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.2);
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
  background-color: #161B22;
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
  color: #8b949e;
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
  color: #FAFAFA;
  font-size: 1.2rem;
}

.infoTitle {
  font-family: $sans-font;
  font-weight: 500;
  color: #c9d1d9;
  font-size: 1.0rem;
  margin-top: 4px;
}

.infoTime {
  font-family: $mono-font;
  color: #8b949e;
  font-size: 0.85rem;
}
</style>