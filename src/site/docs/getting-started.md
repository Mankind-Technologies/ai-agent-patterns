---
sidebar_position: 2
---

# Getting Started

This guide will help you understand and implement AI Agent Patterns in your projects.

## Prerequisites

- Basic understanding of AI agents and their capabilities
- Familiarity with one of the supported libraries:
  - OpenAI Agent SDK (TypeScript or Python)
  - Pydantic AI
- Node.js 18+ (for TypeScript examples) or Python 3.8+ (for Python examples)

## Quick Start

### 1. Choose Your Library

We support multiple AI agent libraries. Pick the one that matches your tech stack:

| Library | Language | Best For |
|---------|----------|----------|
| OpenAI Agent SDK | TypeScript | Modern web applications, serverless functions |
| OpenAI Agent SDK | Python | Data science, ML pipelines, Django/Flask apps |
| Pydantic AI | Python | Type-safe applications, FastAPI integration |

### 2. Install Dependencies

For **TypeScript** projects:
```bash
npm install openai-agent-sdk
```

For **Python** projects:
```bash
pip install openai-agent-sdk
# or
pip install pydantic-ai
```

### 3. Implement Your First Pattern

Let's start with the **Tool Budget Pattern** - it's perfect for learning because it addresses a common real-world concern: controlling costs.

```typescript
// TypeScript example
import { budget } from './patterns/tool-budget';

// Wrap an expensive tool with budget constraints
const expensiveTool = {
  name: "webScraper",
  description: "Scrapes web content",
  execute: async (url: string) => {
    // Expensive operation
    return await scrapeWebsite(url);
  }
};

const budgetedTool = budget(expensiveTool, { maxTimes: 3 });
```

```python
# Python example
from patterns.tool_budget import budget

@budget(max_times=3)
def expensive_web_scraper(url: str) -> str:
    """Scrapes web content - limited to 3 uses."""
    return scrape_website(url)
```

## Understanding the Pattern Structure

Each pattern in our collection follows a consistent structure:

### 1. **Problem Statement**
What specific challenge does this pattern solve?

### 2. **Solution Overview**
The high-level approach to solving the problem.

### 3. **Implementation**
Working code examples across supported libraries.

### 4. **Usage Examples**
Real-world scenarios showing the pattern in action.

### 5. **Best Practices**
Tips for successful implementation and common pitfalls to avoid.

## Pattern Categories

Our patterns are organized into categories:

### 🔧 **Resource Management**
- **Tool Budget**: Limit expensive operations

### 📊 **Monitoring & Observability**
- **Embedded Explaining**: Require agents to explain their tool choices

## Best Practices for Implementation

### 1. **Start Simple**
Begin with one pattern and gradually add complexity.

### 2. **Test Thoroughly**
- Unit tests for pattern logic
- Integration tests with real tools
- Load testing for production scenarios

### 3. **Monitor in Production**
- Track pattern effectiveness
- Monitor resource usage
- Set up alerts for unusual patterns

### 4. **Document Your Implementation**
- Document pattern customizations
- Record configuration decisions
- Share learnings with your team

## Common Pitfalls

### ❌ **Over-Engineering**
Don't implement patterns you don't need. Start with your most pressing challenges.

### ❌ **Ignoring Context**
Patterns should fit your specific use case. Don't force a pattern that doesn't match your needs.

### ❌ **Forgetting Monitoring**
Patterns are only effective if you can measure their impact.

### ❌ **Static Implementation**
Your needs will evolve - build patterns that can adapt and be configured.

## Next Steps

1. **Choose Your First Pattern**: Start with [Tool Budget Pattern](./patterns/tool-budget.md) if you're concerned about costs or [Embedded Explaining Pattern](./patterns/embedded-explaining.md) if you need better observability
2. **Explore Examples**: Check out [working examples](./patterns/tool-budget.md) in your preferred library
3. **Join the Community**: Share your experiences and learn from others

## Need Help?

- **Issues**: Report problems or ask questions
- **Discussions**: Share your use cases and get feedback
- **Examples**: Request examples for specific scenarios 