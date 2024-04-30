all: ts

.PHONY: test integration

ts:
	@yarn install -s
	@yarn run build
	@echo "Built erdstall-ts-sdk."

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