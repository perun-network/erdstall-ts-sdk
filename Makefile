all: ts

ts:
	@npm install -s
	@npm run build -s
	@echo "Built erdstall-ts-sdk."

test:
	@echo "Compiling and executing tests."
	@npm run test
