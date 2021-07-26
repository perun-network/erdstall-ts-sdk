all: ts

.PHONY: test integration

ts:
	@npm install -s
	@npm run build -s
	@echo "Built erdstall-ts-sdk."

bindings:
	@./scripts/genbindings.sh deps/erdstall-contracts

test:
	@echo "Compiling and executing tests."
	@npm run test

integration:
	@echo "Compiling and running integration test."
	@npm run integration-test