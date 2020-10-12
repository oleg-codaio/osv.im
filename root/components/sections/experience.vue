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
            <marker id="head" orient="auto" markerWidth="2" markerHeight="4" refX="0.1" refY="2">
              <path d="M0,0 V4 L2,2 Z" fill="red" :class="$style.pathMarker" />
            </marker>
            <pattern id="pattern" :width="5" :height="3" patternUnits="userSpaceOnUse" :class="$style.pattern" :x="2">
              <line stroke="red" :stroke-width="5" :x1="2" :x2="2" y2="3" />
            </pattern>
          </defs>
          <path
            :class="$style.path"
            ref="path"
            fill="none"
            stroke="url(#pattern)"
            stroke-linejoin="round"
            stroke-linecap="round"
            :stroke-width="strokeWidth"
            shape-rendering="optimizeSpeed"
            marker-start="url(#head)"
            marker-end="url(#head)"
            :d="pathData"
          />
        </svg>
        <div :class="$style.leaves" ref="leaves">
          <div :class="$style.leaf" v-for="exp in experiences" :key="exp.name + exp.when">
            <div
              :class="$style.node"
              :style="{
                backgroundImage: `url('${require(`~/assets/experience/${exp.icon}`)}')`,
              }"
            />
            <div :class="$style.info">
              <div :class="$style.infoHeader">
                <span :class="$style.infoName">{{ exp.name }}</span>
                <span :class="$style.infoTime">{{ exp.when }}</span>
              </div>
              <div :class="$style.infoTitle">{{ exp.title }}</div>
              <div :class="$style.infoDetails" v-html="exp.details" />
            </div>
          </div>
        </div>
      </div>
    </article>
  </section>
</template>

<script lang="ts">
import {Component, Vue} from 'vue-property-decorator';

const initialSegmentSize = 10;
const endingSegmentSize = 5;
const curveSize = 5;

function generateTimelinePath(
  numGrooves: number,
  heightWidthRatio: number,
): {pathData: string; height: number; width: number} {
  const width = 100;
  const grooveHeight = (100 * heightWidthRatio - 65) / numGrooves;
  // const spikeHeight = 3;
  let height = 15;
  let path = `
    M ${width / 2} 0
    L ${width / 2} ${initialSegmentSize}
    Q ${width / 2} ${initialSegmentSize + curveSize},
      ${width / 2 + curveSize} ${initialSegmentSize + curveSize}`;

  let right = true;
  for (let i = 0; i < numGrooves; i++) {
    right = i % 2 === 0;
    path += `
      L ${right ? width - curveSize * 2 : curveSize * 2} ${height}
      Q ${right ? width - curveSize : curveSize} ${height},
        ${right ? width - curveSize : curveSize} ${height + curveSize}
      L ${right ? width - curveSize : curveSize} ${height + grooveHeight}
      Q ${right ? width - curveSize : curveSize} ${height + grooveHeight + curveSize},
        ${right ? width - curveSize * 2 : curveSize * 2} ${height + grooveHeight + curveSize}`;
    height += grooveHeight + curveSize;
  }

  path += `
    L ${right ? width / 2 + curveSize : width / 2 - curveSize} ${height}
    Q ${width / 2} ${height}, ${width / 2} ${height + curveSize}`;

  height += endingSegmentSize;
  return {pathData: path, height, width};
}

@Component
export default class extends Vue {
  protected pathData = '';
  protected pathHeight = 0;
  protected pathWidth = 0;
  protected strokeWidth = 1;
  protected experiences = Experiences;
  protected maxSvgWidthPx = 800;

  // Rendered during animation frame.
  private _animationFrameRequested = false;
  private _appliedStrokeDashOffset = 0;
  private _numShown = 0;

  private _getPathAndLength() {
    const path = this.$refs.path as SVGPathElement;
    const rect = path.getBoundingClientRect();

    // NOTE(oleg): these coefficients are derived from a regression between the optimum scale and the length of this line.
    // WolframAlpha: fit {2.45, 20}, {4.25, 40}, {6.05, 60}, {7.85, 80}, {9.65, 100}
    // const scale = 3.6 + 0.00671 * rect.width;
    const len = path.getTotalLength();
    return {path, rect, len};
  }

  private handleResize(_e?: UIEvent) {
    const leaves = this.$refs.leaves as HTMLDivElement;
    const ratio = leaves.offsetHeight / leaves.offsetWidth;

    const generatedPath = generateTimelinePath(this.experiences.length, ratio);
    this.pathData = generatedPath.pathData;
    this.pathHeight = generatedPath.height;
    this.pathWidth = generatedPath.width;
    this.strokeWidth = 1000 / Math.min(window.innerWidth, this.maxSvgWidthPx);
    console.log('generated path', this.pathHeight, this.pathWidth, this.strokeWidth, ratio);

    this.$nextTick(function () {
      const {path, len} = this._getPathAndLength();
      path.style.strokeDasharray = `${len}`;

      leaves.style.marginTop = `${((initialSegmentSize + curveSize) / this.pathHeight) * leaves.offsetHeight}px`;
      leaves.style.marginBottom = `${(endingSegmentSize / this.pathHeight) * leaves.offsetHeight}px`;

      this.handleScroll();
    });
  }

  private _paint(): void {
    this._animationFrameRequested = false;
    const {path} = this._getPathAndLength();

    path.style.strokeDashoffset = `${this._appliedStrokeDashOffset}`;

    const leaves = this.$refs.leaves as HTMLDivElement;
    let index = 0;
    for (const leaf of Array.from(leaves.childNodes)) {
      if (!(leaf instanceof HTMLElement)) {
        continue; // Exclude text nodes.
      }

      if (this._numShown > index++) {
        if (!leaf.classList.contains('shown')) {
          leaf.classList.add('shown');
        }
      } else {
        if (leaf.classList.contains('shown')) {
          leaf.classList.remove('shown');
        }
      }
    }
  }

  private handleScroll(_e?: Event) {
    const offsetPx = window.innerHeight / 2.5;
    const {rect, len} = this._getPathAndLength();

    const offsetTop = rect.top + window.scrollY - window.innerHeight + offsetPx;
    const visible = Math.max(0, Math.min(1, (window.scrollY - offsetTop) / rect.height));

    this._appliedStrokeDashOffset = len * (1 - visible);
    this._numShown = Math.floor(visible * Experiences.length + 5 / 11);

    if (!this._animationFrameRequested) {
      this._animationFrameRequested = true;
      requestAnimationFrame(this._paint);
    }
  }

  protected mounted(): void {
    this.handleResize();
  }

  protected beforeMount(): void {
    window.addEventListener('resize', this.handleResize);
    window.addEventListener('scroll', this.handleScroll);
  }

  protected beforeDestroy(): void {
    window.removeEventListener('resize', this.handleResize);
    window.removeEventListener('scroll', this.handleScroll);
  }
}

const Experiences = [
  {
    name: 'Coda',
    when: 'June 2016 — Present',
    icon: 'coda.png',
    title: 'Full-Stack Software Engineer',
    details: 'Currently focused on infrastructure, scalability, and security',
  },
  {
    name: 'Northeastern University',
    when: 'Sept 2011 — May 2016',
    icon: 'northeastern.png',
    title: 'BS in Computer Engineering, Minors in Computer Science and Music Performance',
    details: '<i>summa cum laude</i>, Tau Beta Pi, Eta Kappa Nu, Beta Theta Pi',
  },
  {
    name: 'Google',
    when: 'Fall 2015',
    icon: 'google-new.png',
    title: 'Software Engineering Intern, Security',
    details: 'Developed system for automated vulnerability detection',
  },
  {
    name: 'KP Fellows',
    when: 'Summer 2015',
    icon: 'kpfellows.png',
    title: 'Kleiner Perkins Engineering Fellow',
    details: 'Selected from over 2,500 applicants',
  },
  {
    name: 'Shape Security',
    when: 'Summer 2015',
    icon: 'shape.png',
    title: 'Software Engineering Intern',
    details: 'Worked on botwall platform, map-reduce data processing, and visualization',
  },
  {
    name: 'Google',
    when: 'Summer - Fall 2014',
    icon: 'google.png',
    title: 'Software Engineering Intern, Search Infrastructure',
    details: 'Worked on on Google Web Server',
  },
  {
    name: 'Twitter',
    when: 'Summer - Fall 2013',
    icon: 'twitter.png',
    title: 'Software Engineering Intern, Crashlytics',
    details: 'Automated mobile app crash reporting and beta testing (Twitter Fabric / Google Firebase)',
  },
  {
    name: 'Nullient',
    when: 'June 2011 — May 2016',
    icon: 'nullient.png',
    title: 'Owner',
    details: 'Developed mobile apps totalling 85k+ downloads on Google Play Store',
  },
];
</script>

<style lang="scss" module>
@import '../../node_modules/sass-svg-uri/_svg-uri';
@import '~/assets/css/main.scss';

$pathWidth: 4px;

.root {
  background-color: $experience-background-color;
  background-image: svg-uri(
    "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 304 304' width='304' height='304'><path fill='#{$experience-background-accent-color}' fill-opacity='0.4' d='M44.1 224a5 5 0 1 1 0 2H0v-2h44.1zm160 48a5 5 0 1 1 0 2H82v-2h122.1zm57.8-46a5 5 0 1 1 0-2H304v2h-42.1zm0 16a5 5 0 1 1 0-2H304v2h-42.1zm6.2-114a5 5 0 1 1 0 2h-86.2a5 5 0 1 1 0-2h86.2zm-256-48a5 5 0 1 1 0 2H0v-2h12.1zm185.8 34a5 5 0 1 1 0-2h86.2a5 5 0 1 1 0 2h-86.2zM258 12.1a5 5 0 1 1-2 0V0h2v12.1zm-64 208a5 5 0 1 1-2 0v-54.2a5 5 0 1 1 2 0v54.2zm48-198.2V80h62v2h-64V21.9a5 5 0 1 1 2 0zm16 16V64h46v2h-48V37.9a5 5 0 1 1 2 0zm-128 96V208h16v12.1a5 5 0 1 1-2 0V210h-16v-76.1a5 5 0 1 1 2 0zm-5.9-21.9a5 5 0 1 1 0 2H114v48H85.9a5 5 0 1 1 0-2H112v-48h12.1zm-6.2 130a5 5 0 1 1 0-2H176v-74.1a5 5 0 1 1 2 0V242h-60.1zm-16-64a5 5 0 1 1 0-2H114v48h10.1a5 5 0 1 1 0 2H112v-48h-10.1zM66 284.1a5 5 0 1 1-2 0V274H50v30h-2v-32h18v12.1zM236.1 176a5 5 0 1 1 0 2H226v94h48v32h-2v-30h-48v-98h12.1zm25.8-30a5 5 0 1 1 0-2H274v44.1a5 5 0 1 1-2 0V146h-10.1zm-64 96a5 5 0 1 1 0-2H208v-80h16v-14h-42.1a5 5 0 1 1 0-2H226v18h-16v80h-12.1zm86.2-210a5 5 0 1 1 0 2H272V0h2v32h10.1zM98 101.9V146H53.9a5 5 0 1 1 0-2H96v-42.1a5 5 0 1 1 2 0zM53.9 34a5 5 0 1 1 0-2H80V0h2v34H53.9zm60.1 3.9V66H82v64H69.9a5 5 0 1 1 0-2H80V64h32V37.9a5 5 0 1 1 2 0zM101.9 82a5 5 0 1 1 0-2H128V37.9a5 5 0 1 1 2 0V82h-28.1zm16-64a5 5 0 1 1 0-2H146v44.1a5 5 0 1 1-2 0V18h-26.1zm102.2 270a5 5 0 1 1 0 2H98v14h-2v-16h124.1zM242 149.9V160h16v34h-16v62h48v48h-2v-46h-48v-66h16v-30h-16v-12.1a5 5 0 1 1 2 0zM53.9 18a5 5 0 1 1 0-2H64V2H48V0h18v18H53.9zm112 32a5 5 0 1 1 0-2H192V0h50v2h-48v48h-28.1zm-48-48a5 5 0 0 1-9.8-2h2.07a3 3 0 1 0 5.66 0H178v34h-18V21.9a5 5 0 1 1 2 0V32h14V2h-58.1zm0 96a5 5 0 1 1 0-2H137l32-32h39V21.9a5 5 0 1 1 2 0V66h-40.17l-32 32H117.9zm28.1 90.1a5 5 0 1 1-2 0v-76.51L175.59 80H224V21.9a5 5 0 1 1 2 0V82h-49.59L146 112.41v75.69zm16 32a5 5 0 1 1-2 0v-99.51L184.59 96H300.1a5 5 0 0 1 3.9-3.9v2.07a3 3 0 0 0 0 5.66v2.07a5 5 0 0 1-3.9-3.9H185.41L162 121.41v98.69zm-144-64a5 5 0 1 1-2 0v-3.51l48-48V48h32V0h2v50H66v55.41l-48 48v2.69zM50 53.9v43.51l-48 48V208h26.1a5 5 0 1 1 0 2H0v-65.41l48-48V53.9a5 5 0 1 1 2 0zm-16 16V89.41l-34 34v-2.82l32-32V69.9a5 5 0 1 1 2 0zM12.1 32a5 5 0 1 1 0 2H9.41L0 43.41V40.6L8.59 32h3.51zm265.8 18a5 5 0 1 1 0-2h18.69l7.41-7.41v2.82L297.41 50H277.9zm-16 160a5 5 0 1 1 0-2H288v-71.41l16-16v2.82l-14 14V210h-28.1zm-208 32a5 5 0 1 1 0-2H64v-22.59L40.59 194H21.9a5 5 0 1 1 0-2H41.41L66 216.59V242H53.9zm150.2 14a5 5 0 1 1 0 2H96v-56.6L56.6 162H37.9a5 5 0 1 1 0-2h19.5L98 200.6V256h106.1zm-150.2 2a5 5 0 1 1 0-2H80v-46.59L48.59 178H21.9a5 5 0 1 1 0-2H49.41L82 208.59V258H53.9zM34 39.8v1.61L9.41 66H0v-2h8.59L32 40.59V0h2v39.8zM2 300.1a5 5 0 0 1 3.9 3.9H3.83A3 3 0 0 0 0 302.17V256h18v48h-2v-46H2v42.1zM34 241v63h-2v-62H0v-2h34v1zM17 18H0v-2h16V0h2v18h-1zm273-2h14v2h-16V0h2v16zm-32 273v15h-2v-14h-14v14h-2v-16h18v1zM0 92.1A5.02 5.02 0 0 1 6 97a5 5 0 0 1-6 4.9v-2.07a3 3 0 1 0 0-5.66V92.1zM80 272h2v32h-2v-32zm37.9 32h-2.07a3 3 0 0 0-5.66 0h-2.07a5 5 0 0 1 9.8 0zM5.9 0A5.02 5.02 0 0 1 0 5.9V3.83A3 3 0 0 0 3.83 0H5.9zm294.2 0h2.07A3 3 0 0 0 304 3.83V5.9a5 5 0 0 1-3.9-5.9zm3.9 300.1v2.07a3 3 0 0 0-1.83 1.83h-2.07a5 5 0 0 1 3.9-3.9zM97 100a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0-16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm16 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm16 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-48 32a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm16 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm32 48a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-16 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm32-16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0-32a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm16 32a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm32 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0-16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-16-64a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm16 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm16 96a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm16 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm16-144a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0 32a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm16-32a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm16-16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-96 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm16-32a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm96 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-16-64a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm16-16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-32 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0-16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-16 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-16 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-16 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM49 36a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-32 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm32 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM33 68a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm16-48a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0 240a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm16 32a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-16-64a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-16-32a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm80-176a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm16 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-16-16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm32 48a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm16-16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0-32a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm112 176a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-16 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM17 180a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0-32a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm16 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM17 84a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm32 64a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm16-16a3 3 0 1 0 0-6 3 3 0 0 0 0 6z'/></svg>"
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
}

.leaves {
  width: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.leaf {
  $leafPadding: 10vw;
  display: flex;
  align-items: center;
  flex-grow: 0;
  padding-top: 5vw;
  padding-bottom: 5vw;
  max-width: 100vw - $leafPadding * 2;
  transition: opacity 0.3s, transform 0.3s;
  opacity: 0;
  will-change: opacity, transform;

  @media only screen and (min-width: 800px) {
    // Until the following, we can't use variables here
    // https://github.com/w3c/csswg-drafts/issues/2627
    $leafPadding: 80px;
    max-width: 800px - $leafPadding * 2;
    padding-top: 40px;
    padding-bottom: 40px;
  }

  &:nth-child(odd) {
    flex-direction: row-reverse;
    align-self: flex-end;
    transform: translateX(-50px);
    padding-right: $leafPadding;
    text-align: right;

    .node {
      &::after {
        left: calc(100% + 10px);
        background: linear-gradient(to right, red, transparent);
      }
    }

    .infoHeader {
      flex-direction: row-reverse;
    }
  }

  &:nth-child(even) {
    padding-left: $leafPadding;
    transform: translateX(50px);
  }

  &:global(.shown) {
    opacity: 1;
    transform: translateX(0%);
  }

  @media only screen and (max-width: 768px) {
    $mobilePadding: 10vw;

    .info {
      padding: 0;
    }

    &.leaf {
      flex-direction: column;

      &:nth-child(odd) {
        padding-right: $mobilePadding;
        align-items: flex-end;

        .node {
          background-position-x: right;
        }
      }

      &:nth-child(even) {
        padding-left: $mobilePadding;
        align-items: flex-start;

        .node {
          background-position-x: left;
        }
      }

      .node {
        margin-bottom: 10px;
      }

      .infoHeader {
        flex-direction: column;
      }

      .infoTime {
        padding: 0;
      }
    }
  }
}

.node {
  background-size: contain;
  background-repeat: no-repeat;
  background-position-x: center;
  background-position-y: center;
  flex: none;
  min-height: 110px;
  max-height: 110px;
  width: 150px;
  position: relative;
}

.info {
  padding-top: 5px;
  padding-left: 20px;
  padding-right: 20px;
  display: inline-block;
  height: 105px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.intoTitle {
  margin-top: 8px;
}

.infoDetails {
  color: #444;
  font-style: italic;
}

.infoHeader {
  display: inline-flex;
  align-content: center;
  flex: none;
}

.infoName {
  display: inline;
  color: $experience-line-start-color;
  background: linear-gradient(to right, $experience-line-start-color, $experience-line-end-color);
  background-clip: text;
  -webkit-text-fill-color: transparent;
  font-size: larger;
}

.infoTime {
  color: gray;
  padding-left: 10px;
  padding-right: 10px;
  margin-top: 5px;
  font-size: smaller;
}

$startColor: $experience-line-start-color;
$endColor: $experience-line-end-color;

@keyframes markerAnimation {
  0% {
    fill: $startColor;
  }
  50% {
    fill: $endColor;
  }
  100% {
    fill: $startColor;
  }
}

@keyframes pathAnimation {
  0% {
    transform: translateX(0px);
    stroke: $startColor;
  }
  50% {
    stroke: $endColor;
  }
  100% {
    transform: translateX(1px);
    stroke: $startColor;
  }
}

.pattern,
.pattern line {
  animation-name: pathAnimation;
  animation-direction: alternate;
  animation-duration: 1s;
  animation-timing-function: ease-in-out;
  animation-iteration-count: infinite;
}

.pathMarker {
  animation-name: markerAnimation;
  animation-direction: alternate;
  animation-duration: 1s;
  animation-timing-function: ease-in-out;
  animation-iteration-count: infinite;
  will-change: stroke-dashoffset;
}
</style>