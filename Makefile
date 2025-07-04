# AI Agent Patterns - Makefile for Docusaurus Site Management

# Variables
SITE_DIR = src/site
RED = \033[0;31m
GREEN = \033[0;32m
YELLOW = \033[1;33m
BLUE = \033[0;34m
NC = \033[0m

# Default target
.DEFAULT_GOAL := help

# Phony targets (don't correspond to files)
.PHONY: help site-install site-start site-dev site-build site-serve site-clean site-check site-update site-audit

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
