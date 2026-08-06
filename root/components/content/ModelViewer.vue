<template>
  <div :class="$style.container">
    <model-viewer ref="modelViewerRef" v-bind="$attrs" @load="onLoad">
      <slot />
    </model-viewer>
    <button v-if="toggleCover || toggleShell" type="button" :class="$style.toggleButton" @click="onToggleCover">
      <span>{{ isCoverVisible ? 'Hide Shell' : 'Show Shell' }}</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import {ref} from 'vue';

const props = defineProps<{
  color?: string;
  roughness?: number;
  metallic?: number;
  toggleCover?: boolean;
  toggleShell?: boolean;
}>();

const modelViewerRef = ref<{
  model?: {
    materials?: Array<{
      name?: string;
      pbrMetallicRoughness?: {
        baseColorFactor?: [number, number, number, number];
        setBaseColorFactor: (color: [number, number, number, number]) => void;
        setRoughnessFactor: (val: number) => void;
        setMetallicFactor: (val: number) => void;
      };
    }>;
  };
} | null>(null);

const isCoverVisible = ref(false);
let coverOriginalRgba: [number, number, number, number] = [0.4, 0.7, 0.85, 1.0];

function hexToRgba(hex: string): [number, number, number, number] {
  const cleanHex = hex.replace('#', '');
  if (cleanHex.length === 6) {
    const r = parseInt(cleanHex.substring(0, 2), 16) / 255;
    const g = parseInt(cleanHex.substring(2, 4), 16) / 255;
    const b = parseInt(cleanHex.substring(4, 6), 16) / 255;
    return [r, g, b, 1.0];
  }
  return [0.15, 0.65, 0.65, 1.0];
}

function isCoverMaterial(mat: {
  name?: string;
  pbrMetallicRoughness?: {
    baseColorFactor?: [number, number, number, number];
  };
}): boolean {
  if (!mat) return false;
  if (
    mat.name === 'material_5' ||
    mat.name === 'material_6' ||
    mat.name?.includes('cover') ||
    mat.name?.includes('shell')
  ) {
    return true;
  }
  const factor = mat.pbrMetallicRoughness?.baseColorFactor;
  if (factor && factor[3] < 0.99) {
    return true;
  }
  return false;
}

function onLoad() {
  const viewer = modelViewerRef.value;
  if (!viewer?.model?.materials?.length) return;

  // If toggleCover / toggleShell is enabled, set initial cover opacity to 10% (hidden state)
  if (props.toggleCover || props.toggleShell) {
    for (const mat of viewer.model.materials) {
      if (isCoverMaterial(mat)) {
        const factor = mat.pbrMetallicRoughness?.baseColorFactor;
        if (factor) {
          coverOriginalRgba = [factor[0], factor[1], factor[2], 1.0];
        }
        mat.pbrMetallicRoughness?.setBaseColorFactor([
          coverOriginalRgba[0],
          coverOriginalRgba[1],
          coverOriginalRgba[2],
          0.1,
        ]);
      }
    }
  }

  // Only apply material overrides if explicit props were passed
  if (props.color || props.roughness !== undefined || props.metallic !== undefined) {
    const material = viewer.model.materials[0];
    if (material?.pbrMetallicRoughness) {
      if (props.color) {
        material.pbrMetallicRoughness.setBaseColorFactor(hexToRgba(props.color));
      }
      if (props.roughness !== undefined) {
        material.pbrMetallicRoughness.setRoughnessFactor(props.roughness);
      }
      if (props.metallic !== undefined) {
        material.pbrMetallicRoughness.setMetallicFactor(props.metallic);
      }
    }
  }
}

function onToggleCover() {
  const viewer = modelViewerRef.value;
  if (!viewer?.model?.materials?.length) return;

  isCoverVisible.value = !isCoverVisible.value;

  for (const mat of viewer.model.materials) {
    if (isCoverMaterial(mat)) {
      if (mat.pbrMetallicRoughness) {
        if (isCoverVisible.value) {
          mat.pbrMetallicRoughness.setBaseColorFactor([
            coverOriginalRgba[0],
            coverOriginalRgba[1],
            coverOriginalRgba[2],
            1.0,
          ]);
        } else {
          mat.pbrMetallicRoughness.setBaseColorFactor([
            coverOriginalRgba[0],
            coverOriginalRgba[1],
            coverOriginalRgba[2],
            0.1,
          ]);
        }
      }
    }
  }
}
</script>

<style lang="scss" module>
.container {
  position: relative;
  width: 100%;
  margin: 16px 0 32px;
}

.toggleButton {
  position: absolute;
  top: 1rem;
  right: 1rem;
  z-index: 5;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.4rem 0.8rem;
  font-family: inherit;
  font-size: 0.85rem;
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
</style>
