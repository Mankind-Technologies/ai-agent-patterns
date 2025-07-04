# AI Agent Patterns

A collection of useful AI agent patterns for developers building with AI agents.

## Overview

This repository stores, explains, and studies different patterns for AI agents, including:
- Agent-to-agent collaboration
- Agents using tools effectively
- Human-agent interactions
- Other useful interaction patterns

## What's Inside

- **Patterns**: Practical examples of AI agent patterns implemented across different libraries
- **Documentation**: Comprehensive guides and explanations
- **Website**: Interactive documentation site for exploring patterns

## Supported Libraries

- OpenAI Agent SDK (TypeScript & Python)
- Pydantic AI Agents

## Structure

```
src/
├── site/          # Documentation website
└── patterns/      # Pattern implementations
    ├── embeddedExplaining/
    └── toolBudget/
```

## Getting Started

1. Browse the patterns in the `src/patterns/` directory
2. Each pattern includes working examples for different AI libraries
3. Check the documentation site for detailed explanations

## Development

This repository includes automated checks to ensure all pattern projects compile correctly.

### Available Commands

**Site Management:**
- `make site-install` - Install Docusaurus dependencies
- `make site-start` - Start development server
- `make site-build` - Build production site

**Pattern Development:**
- `make patterns-install` - Install dependencies for all patterns
- `make patterns-build` - Build all pattern projects
- `make patterns-check` - Type-check all pattern projects
- `make patterns-test` - Test all pattern projects
- `make check-all` - Run all checks (site + patterns)

### CI/CD

The repository includes a GitHub Action that automatically:
- ✅ Installs dependencies for all patterns
- ✅ Type-checks all TypeScript projects
- ✅ Builds all pattern projects
- ✅ Runs available tests
- ✅ Verifies the documentation site builds correctly

This ensures that all pattern examples remain functional and can be compiled successfully.

## Contributing

See [AGENTS.md](./AGENTS.md) for contribution guidelines.

---

*Focus on communication, simplicity, and comprehensive coverage of modern AI agent frameworks.* 