all: ts

.PHONY: test

ts:
	@npm install -s
	@npm run build -s
	@echo "Built erdstall-ts-sdk."

bindings:
	@./scripts/genbindings.sh deps/erdstall-contracts

test:
	@echo "Compiling and executing tests."
	@npm run test
