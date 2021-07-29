all: ts

.PHONY: test integration

ts:
	@yarn install -s
	@yarn run build -s
	@echo "Built erdstall-ts-sdk."

bindings:
	@./scripts/genbindings.sh deps/erdstall-contracts

test:
	@echo "Compiling and executing tests."
	@yarn run test

integration:
	@echo "Compiling and running integration test."
	@yarn run test:integration