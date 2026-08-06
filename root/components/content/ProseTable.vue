<template>
  <div :class="$style.tableWrapper">
    <slot />
  </div>
</template>

<style lang="scss" module>
.tableWrapper {
  margin: 32px 0;
  width: 100%;
  overflow-x: auto;
  border-radius: 12px;
  background: var(--bg-card, #0d1117);
  border: 1px solid var(--border-color, #30363d);
  box-shadow: 0 6px 24px rgb(0 0 0 / 30%);

  :global(table) {
    margin: 0;
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
    font-size: 0.78rem;
    line-height: 1.4;
    background: transparent;
    border: none;
    box-shadow: none;
  }

  :global(th),
  :global(td) {
    padding: 8px 10px;
    text-align: left;
    vertical-align: top;
    border-bottom: 1px solid rgb(255 255 255 / 6%);
  }

  :global(td) {
    font-size: 0.78rem;
    line-height: 1.4;
    color: var(--text-muted-light, #c9d1d9);
  }

  :global(td p) {
    font-size: 0.78rem;
    line-height: 1.4;
    margin: 0;
  }

  :global(th) {
    font-family: 'Fira Code', 'JetBrains Mono', monospace;
    font-size: 0.68rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--text-muted, #8b949e);
    background: rgb(255 255 255 / 3%);
    border-bottom: 1px solid var(--border-color, #30363d);
    white-space: nowrap;
  }

  :global(tr:nth-child(even) td) {
    background: rgb(255 255 255 / 1.5%);
  }

  :global(tr:hover td) {
    background: rgb(255 255 255 / 4%);
    transition: background 0.15s ease;
  }

  :global(tbody tr:last-child td) {
    border-bottom: none;
  }

  :global(td:first-child) {
    white-space: nowrap;
    font-family: 'Fira Code', 'JetBrains Mono', monospace;
    font-size: 0.76rem;
    font-weight: 600;
  }

  :global(td:nth-child(2)) {
    white-space: nowrap;
    font-weight: 500;
  }

  :global(code) {
    font-family: 'Fira Code', 'JetBrains Mono', monospace;
    font-size: 0.74rem;
    padding: 1px 5px;
    background: rgb(255 255 255 / 7%);
    border: 1px solid rgb(255 255 255 / 10%);
    border-radius: 4px;
    color: #e4e4e7;
    display: inline-block;
    vertical-align: top;
    margin-top: -1px;
  }
}
</style>
