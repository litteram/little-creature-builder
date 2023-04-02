# DD2VTT foundry importer

modulename := "little-things"
src := $(wildcard src/*.ts src/**/*.ts)
target := module.js
zipsources := module.json ${target} ${target}.map
zipfile := ${modulename}.zip

all: ${target}

${rollup}:
	npm install --dev

${target}: ${src}
	npx rollup \
		-c rollup.config.js \
		-o module.js

standalone.js: ${src}
	npx rollup \
		-c rollup.config.js \
		-i src/standalone.ts \
		-o standalone.js

watch: ${target}

${zipfile}: ${zipsources}
	mkdir -p ${modulename}

	for fn in ${zipsources}; do \
		ln -s $${fn} $${modulename}/; \
	done

	zip -r ${zipfile} \
		${modulename}


.PHONY: watch

# end
