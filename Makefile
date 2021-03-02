develop:
	npx webpack serve

install:
	npm ci

build:
	rm -rf dist
	npx webpack

test:
	npm test

lint:
	npx eslint .

.PHONY: test