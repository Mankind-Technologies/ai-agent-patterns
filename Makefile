# AI Agent Patterns - Makefile for Docusaurus Site Management and Pattern Compilation

# Variables
SITE_DIR = src/site
PATTERNS_DIR = src/patterns
RED = \033[0;31m
GREEN = \033[0;32m
YELLOW = \033[1;33m
BLUE = \033[0;34m
NC = \033[0m

# Default target
.DEFAULT_GOAL := help

# Phony targets (don't correspond to files)
.PHONY: help site-install site-start site-dev site-build site-serve site-clean site-check site-update site-audit
.PHONY: patterns-install patterns-build patterns-check patterns-clean patterns-test check-all

# Help target
help:
	@printf "$(BLUE)AI Agent Patterns - Available Commands$(NC)\n"
	@printf "\n"
	@printf "$(GREEN)Site Management:$(NC)\n"
	@printf "  site-install     Install Docusaurus dependencies\n"
	@printf "  site-start       Start development server\n"
	@printf "  site-build       Build production site\n"
	@printf "  site-serve       Serve production build locally\n"
	@printf "  site-clean       Clean build artifacts\n"
	@printf "\n"
	@printf "$(GREEN)Pattern Development:$(NC)\n"
	@printf "  patterns-install Install dependencies for all patterns\n"
	@printf "  patterns-build   Build all pattern projects\n"
	@printf "  patterns-check   Type-check all pattern projects\n"
	@printf "  patterns-clean   Clean pattern build artifacts\n"
	@printf "  patterns-test    Test all pattern projects\n"
	@printf "  check-all        Run all checks (site + patterns)\n"
	@printf "\n"
	@printf "$(GREEN)Development:$(NC)\n"
	@printf "  site-dev         Start development server (alias for site-start)\n"
	@printf "  site-check       Check for broken links and issues\n"
	@printf "\n"
	@printf "$(GREEN)Maintenance:$(NC)\n"
	@printf "  site-update      Update dependencies\n"
	@printf "  site-audit       Run security audit\n"
	@printf "\n"
	@printf "$(YELLOW)Usage:$(NC)\n"
	@printf "  make <command>\n"
	@printf "  Example: make site-start\n"
	@printf "  Example: make patterns-build\n"
	@printf "  Example: make check-all\n"
	@printf "\n"

# Check if site directory exists
check-directory:
	@if [ ! -d "$(SITE_DIR)" ]; then \
		printf "$(RED)Error: $(SITE_DIR) directory not found$(NC)\n"; \
		printf "Make sure you're running this from the project root\n"; \
		exit 1; \
	fi

# Site management targets
site-install: check-directory
	@printf "$(BLUE)Installing Docusaurus dependencies...$(NC)\n"
	@cd $(SITE_DIR) && npm install
	@printf "$(GREEN)Dependencies installed successfully!$(NC)\n"

site-start: check-directory
	@printf "$(BLUE)Starting Docusaurus development server...$(NC)\n"
	@cd $(SITE_DIR) && npm start

site-dev: site-start

site-build: check-directory
	@printf "$(BLUE)Building Docusaurus site for production...$(NC)\n"
	@cd $(SITE_DIR) && npm run build
	@printf "$(GREEN)Site built successfully!$(NC)\n"
	@printf "$(YELLOW)Build output is in: $(SITE_DIR)/build$(NC)\n"

site-serve: check-directory
	@printf "$(BLUE)Serving production build locally...$(NC)\n"
	@cd $(SITE_DIR) && npm run serve

site-clean: check-directory
	@printf "$(BLUE)Cleaning build artifacts...$(NC)\n"
	@cd $(SITE_DIR) && rm -rf build .docusaurus
	@printf "$(GREEN)Build artifacts cleaned!$(NC)\n"

site-check: check-directory
	@printf "$(BLUE)Checking for broken links and issues...$(NC)\n"
	@cd $(SITE_DIR) && npm run build
	@printf "$(GREEN)Site check completed!$(NC)\n"

site-update: check-directory
	@printf "$(BLUE)Updating dependencies...$(NC)\n"
	@cd $(SITE_DIR) && npm update
	@printf "$(GREEN)Dependencies updated!$(NC)\n"

site-audit: check-directory
	@printf "$(BLUE)Running security audit...$(NC)\n"
	@cd $(SITE_DIR) && npm audit
	@printf "$(GREEN)Security audit completed!$(NC)\n"

# Pattern management targets
patterns-install:
	@printf "$(BLUE)Installing dependencies for all patterns...$(NC)\n"
	@for pattern_dir in $(PATTERNS_DIR)/*/; do \
		if [ -d "$$pattern_dir" ]; then \
			for project_dir in $$pattern_dir*/; do \
				if [ -f "$$project_dir/package.json" ]; then \
					printf "$(YELLOW)Installing dependencies for $$(basename $$project_dir)...$(NC)\n"; \
					cd "$$project_dir" && npm install && cd - > /dev/null; \
				fi; \
			done; \
		fi; \
	done
	@printf "$(GREEN)All pattern dependencies installed!$(NC)\n"

patterns-build:
	@printf "$(BLUE)Building all pattern projects...$(NC)\n"
	@failed=0; \
	for pattern_dir in $(PATTERNS_DIR)/*/; do \
		if [ -d "$$pattern_dir" ]; then \
			for project_dir in $$pattern_dir*/; do \
				if [ -f "$$project_dir/package.json" ]; then \
					printf "$(YELLOW)Building $$(basename $$project_dir)...$(NC)\n"; \
					cd "$$project_dir" && { \
						if grep -q '"build"' package.json; then \
							npm run build || failed=1; \
						else \
							npx tsc --noEmit || failed=1; \
						fi; \
					} && cd - > /dev/null; \
				fi; \
			done; \
		fi; \
	done; \
	if [ $$failed -eq 0 ]; then \
		printf "$(GREEN)All patterns built successfully!$(NC)\n"; \
	else \
		printf "$(RED)Some patterns failed to build!$(NC)\n"; \
		exit 1; \
	fi

patterns-check:
	@printf "$(BLUE)Type-checking all pattern projects...$(NC)\n"
	@failed=0; \
	for pattern_dir in $(PATTERNS_DIR)/*/; do \
		if [ -d "$$pattern_dir" ]; then \
			for project_dir in $$pattern_dir*/; do \
				if [ -f "$$project_dir/package.json" ] && [ -f "$$project_dir/tsconfig.json" ]; then \
					printf "$(YELLOW)Type-checking $$(basename $$project_dir)...$(NC)\n"; \
					cd "$$project_dir" && npx tsc --noEmit || failed=1; \
					cd - > /dev/null; \
				fi; \
			done; \
		fi; \
	done; \
	if [ $$failed -eq 0 ]; then \
		printf "$(GREEN)All patterns type-checked successfully!$(NC)\n"; \
	else \
		printf "$(RED)Some patterns failed type-checking!$(NC)\n"; \
		exit 1; \
	fi

patterns-clean:
	@printf "$(BLUE)Cleaning pattern build artifacts...$(NC)\n"
	@for pattern_dir in $(PATTERNS_DIR)/*/; do \
		if [ -d "$$pattern_dir" ]; then \
			for project_dir in $$pattern_dir*/; do \
				if [ -d "$$project_dir" ]; then \
					printf "$(YELLOW)Cleaning $$(basename $$project_dir)...$(NC)\n"; \
					cd "$$project_dir" && rm -rf dist build node_modules/.cache && cd - > /dev/null; \
				fi; \
			done; \
		fi; \
	done
	@printf "$(GREEN)Pattern build artifacts cleaned!$(NC)\n"

patterns-test:
	@printf "$(BLUE)Running tests for all pattern projects...$(NC)\n"
	@failed=0; \
	for pattern_dir in $(PATTERNS_DIR)/*/; do \
		if [ -d "$$pattern_dir" ]; then \
			for project_dir in $$pattern_dir*/; do \
				if [ -f "$$project_dir/package.json" ]; then \
					printf "$(YELLOW)Testing $$(basename $$project_dir)...$(NC)\n"; \
					cd "$$project_dir" && { \
						if grep -q '"test"' package.json && ! grep -q '"Error: no test specified"' package.json; then \
							npm test || failed=1; \
						else \
							printf "$(YELLOW)No tests configured for $$(basename $$project_dir), skipping...$(NC)\n"; \
						fi; \
					} && cd - > /dev/null; \
				fi; \
			done; \
		fi; \
	done; \
	if [ $$failed -eq 0 ]; then \
		printf "$(GREEN)All pattern tests passed!$(NC)\n"; \
	else \
		printf "$(RED)Some pattern tests failed!$(NC)\n"; \
		exit 1; \
	fi

check-all: site-check patterns-check
	@printf "$(GREEN)All checks completed successfully!$(NC)\n"

# Quick aliases
install: site-install
start: site-start
dev: site-dev
build: site-build
serve: site-serve
clean: site-clean
check: site-check
update: site-update
audit: site-audit
