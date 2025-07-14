all: ts

.PHONY: test integration

clean:
	@rm -rf dist

ts:
	@if [ ! -s node_modules ]; then \
		mkdir -p /tmp/$(PWD)/node_modules; \
		ln -s /tmp/$(PWD)/node_modules node_modules; \
		echo "Created node_modules folder in /tmp/$(PWD)/node_modules"; \
	fi

	@if [ ! -s dist ]; then \
		mkdir -p /tmp/$(PWD)/dist; \
		ln -s /tmp/$(PWD)/dist dist; \
		echo "Created dist folder in /tmp/$(PWD)/dist"; \
		\
		yarn install -s; \
		echo "Initialised yarn"; \
	fi

	@yarn run build
	@echo "Built erdstall-ts-sdk."
	@if [ ! -s dist/package.json ]; \
	then yarn run devpub; \
	fi

bindings:
	@./scripts/genbindings.sh deps/erdstall-contracts

test:
	@echo "Compiling and executing tests."
	@yarn run test

test-e2e:
	@echo "Compiling and executing end-to-end tests."
	@yarn run test:e2e:session

integration:
	@echo "Compiling and running integration test."
	@yarn run test:integration