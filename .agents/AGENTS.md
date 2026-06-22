# Agent Guidelines for osv.im

Welcome! You are pair programming on the portfolio repository of Oleg Vaskevich. Please review and adhere to the guidelines below to ensure quality and compliance.

## Technical Stack
- **Nuxt 4 / Vue 3**: Uses Composition API with `<script setup>`.
- **CSS Modules**: Styles are authored using SCSS and bound via `$style` variables (`<style lang="scss" module>`).
- **Content**: Static collections are driven by Nuxt Content v3.

## Coding Conventions
- **Client/Server Checks**: Always use `import.meta.client` (and `import.meta.server`) instead of `process.client` or `process.server`.
- **Component File Casing**: 
  - Standard components directly in `root/components/*.vue` must use **PascalCase**.
  - Folder-based components (e.g. `root/components/sections/*.vue`) use **lowercase/camelCase**.
- **ESLint Bypasses**: Whenever you add an ESLint bypass comment (like `eslint-disable-next-line`), always append a `--` followed by a clear justification.
  *Example:* `<!-- eslint-disable-next-line vue/no-v-html -- The details HTML content is locally authored in experience.vue and contains safe formatting tags. -->`

## Linting & Formatting Rules
We maintain a strict **zero-warning policy** on CI. All warnings are treated as errors.
- **Prettier**: Governs all code formatting (e.g. self-closing void tags). Do not let ESLint rules conflict with Prettier (e.g. `vue/html-self-closing` is disabled in ESLint).
- **ESLint**: Enforces JS/TS quality, attribute order, and filename patterns.
- **Stylelint**: Enforces stylesheet formatting. Allows camelCase variables, keyframes, and selectors to accommodate CSS Modules.

## Key Developer Commands
Execute these in the `root` directory:
- Run dev server: `pnpm dev`
- Run all checks: `pnpm run lint && pnpm run prettier:check && pnpm run lint:style`
- Fix formatting/styles: `pnpm run prettier:write && pnpm run lint:style:fix`
