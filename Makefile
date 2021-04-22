all: ts

ts:
	@npm install -s
	@npm run build -s
	@echo "Built erdstall-ts-sdk."