---
sidebar_position: 1
---

# Libraries Overview

AI Agent Patterns provides implementations across multiple popular AI agent frameworks. Each library has its own strengths and is suited for different use cases.

## Supported Libraries

### OpenAI Agent SDK (TypeScript)
<div className="pattern-card">
<div className="badges">
<span className="badge badge--agent">TypeScript</span>
<span className="badge badge--tool">Web Applications</span>
</div>

**Best For**: Modern web applications, serverless functions, Next.js applications

**Key Features**:
- Full TypeScript support with type safety
- Async/await patterns
- Integration with React and Node.js ecosystems
- Excellent for frontend and backend applications

**Installation**:
```bash
npm install openai-agent-sdk
```

[Learn More →](./openai-agent-sdk-ts.md)
</div>

### Coming Soon: Python Support
We're working on implementing pattern support for:
- OpenAI Agent SDK (Python)
- Pydantic AI


## Choosing the Right Library

### By Programming Language

| Language | Libraries Available | Recommendation |
|----------|-------------------|----------------|
| **TypeScript/JavaScript** | OpenAI Agent SDK | Best choice for web applications |
| **Python** | Coming Soon | Python support in development |

### By Application Type

| Application Type | Recommended Library | Reason |
|------------------|-------------------|--------|
| **Web Frontend** | OpenAI Agent SDK (TS) | React integration, browser compatibility |
| **Serverless** | OpenAI Agent SDK (TS) | Lightweight, fast cold starts |
| **Node.js Backend** | OpenAI Agent SDK (TS) | Full TypeScript ecosystem support |

### By Team Expertise

| Team Background | Recommended Library | Benefits |
|-----------------|-------------------|----------|
| **Frontend Developers** | OpenAI Agent SDK (TS) | Familiar patterns, great tooling |
| **Backend Engineers** | OpenAI Agent SDK (TS) | Type safety, modern async patterns |
| **Full-Stack Teams** | OpenAI Agent SDK (TS) | Consistency across stack |

## Pattern Compatibility

All patterns are designed to work across all supported libraries:

| Pattern | TypeScript | Notes |
|---------|------------|-------|
| **Tool Budget** | ✅ | Full implementation available |
| **Embedded Explaining** | ✅ | Full implementation available |

## Migration Between Libraries

*Migration guides will be available once Python support is implemented.*

## Getting Started

### 1. Choose Your Library
Based on your tech stack and requirements above.

### 2. Install Dependencies
Follow the installation instructions for your chosen library.

### 3. Implement Your First Pattern
Start with the [Tool Budget Pattern](../patterns/tool-budget.md) or [Embedded Explaining Pattern](../patterns/embedded-explaining.md):

- [Tool Budget TypeScript Example](../examples/tool-budget-openai-ts.md)
- [Embedded Explaining TypeScript Example](../examples/embedded-explaining-openai-ts.md)

### 4. Explore Advanced Patterns
Once you're comfortable with the basics, explore more complex patterns and combinations.

## Community & Support

### Library-Specific Resources

- **OpenAI Agent SDK**: [GitHub](https://github.com/openai/agent-sdk) | [Documentation](https://docs.openai.com/agent-sdk)

### Pattern-Specific Help

- **GitHub Issues**: Report bugs or request features
- **Discussions**: Share use cases and get community help
- **Examples**: Browse real-world implementations

## Contributing

We welcome contributions for all supported libraries:

1. **New Pattern Implementations**: Add pattern support to additional libraries
2. **Bug Fixes**: Improve existing implementations
3. **Documentation**: Help improve examples and guides
4. **Testing**: Add test coverage for different scenarios

Each contribution should maintain consistency across all supported libraries where possible.

## Next Steps

1. [Choose your library](./openai-agent-sdk-ts.md) based on your needs
2. [Implement your first pattern](../patterns/tool-budget.md)
3. [Explore examples](../examples/tool-budget-openai-ts.md) for your chosen library
4. [Join the community](https://github.com/ai-agent-patterns/ai-agent-patterns) and share your experience 