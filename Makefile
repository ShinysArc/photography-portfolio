# ---- Go lint/format helpers ----
GO_DIR := server

.PHONY: lint lint-fix vet tidy
lint:
	cd $(GO_DIR) && /home/seiya/go/bin/golangci-lint run ./...

lint-fix: ## format with gofumpt
	cd $(GO_DIR) && gofumpt -l -w .

vet:
	cd $(GO_DIR) && go vet ./...

tidy:
	cd $(GO_DIR) && go mod tidy
