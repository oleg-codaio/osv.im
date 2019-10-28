ifndef VERBOSE
.SILENT:
endif

default: dev

.PHONY: _compile-modules
_compile-modules:
	npx tsc modules/*.ts \
		--outDir modules/.generated \
		--lib es2018 \
		--esModuleInterop

.PHONY: dev
dev: _compile-modules
	npx ts-node -r ts-node/register node_modules/.bin/nuxt dev -c nuxt.config.ts

.PHONY: generate
generate: _compile-modules
	npx ts-node -r ts-node/register node_modules/.bin/nuxt generate -c nuxt.config.ts
