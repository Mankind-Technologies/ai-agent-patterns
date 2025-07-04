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

### OpenAI Agent SDK (Python)
<div className="pattern-card">
<div className="badges">
<span className="badge badge--agent">Python</span>
<span className="badge badge--pattern">Data Science</span>
</div>

**Best For**: Data science workflows, ML pipelines, Django/Flask applications

**Key Features**:
- Pythonic API design
- Integration with scientific computing stack
- Excellent for data processing and analysis
- Great for Jupyter notebooks and research

**Installation**:
```bash
pip install openai-agent-sdk
```

Learn More (coming soon)
</div>

### Pydantic AI
<div className="pattern-card">
<div className="badges">
<span className="badge badge--agent">Python</span>
<span className="badge badge--tool">Type Safety</span>
</div>

**Best For**: Type-safe applications, FastAPI integration, production Python services

**Key Features**:
- Built-in data validation with Pydantic
- Type-safe tool definitions
- Excellent FastAPI integration
- Strong schema validation

**Installation**:
```bash
pip install pydantic-ai
```

Learn More (coming soon)
</div>

## Choosing the Right Library

### By Programming Language

| Language | Libraries Available | Recommendation |
|----------|-------------------|----------------|
| **TypeScript/JavaScript** | OpenAI Agent SDK | Best choice for web applications |
| **Python** | OpenAI Agent SDK, Pydantic AI | OpenAI SDK for ML/research, Pydantic AI for web services |

### By Application Type

| Application Type | Recommended Library | Reason |
|------------------|-------------------|--------|
| **Web Frontend** | OpenAI Agent SDK (TS) | React integration, browser compatibility |
| **API Services** | Pydantic AI | Type safety, FastAPI integration |
| **Data Science** | OpenAI Agent SDK (Python) | Scientific computing ecosystem |
| **Serverless** | OpenAI Agent SDK (TS) | Lightweight, fast cold starts |
| **Enterprise** | Pydantic AI | Strong validation, type safety |

### By Team Expertise

| Team Background | Recommended Library | Benefits |
|-----------------|-------------------|----------|
| **Frontend Developers** | OpenAI Agent SDK (TS) | Familiar patterns, great tooling |
| **Data Scientists** | OpenAI Agent SDK (Python) | Jupyter integration, NumPy/Pandas |
| **Backend Engineers** | Pydantic AI | Type safety, validation, FastAPI |
| **Full-Stack Teams** | OpenAI Agent SDK (both) | Consistency across stack |

## Pattern Compatibility

All patterns are designed to work across all supported libraries:

| Pattern | TypeScript | Python (OpenAI) | Pydantic AI | Notes |
|---------|------------|-----------------|-------------|-------|
| **Tool Budget** | ✅ | ✅ | ✅ | Full feature parity |
| **Fallback Chain** | 🚧 | 🚧 | 🚧 | Coming soon |
| **Rate Limiting** | 🚧 | 🚧 | 🚧 | Coming soon |
| **Circuit Breaker** | 🚧 | 🚧 | 🚧 | Coming soon |

## Migration Between Libraries

### From OpenAI SDK (Python) to Pydantic AI

```python
# Before (OpenAI SDK)
from openai_agent_sdk import Agent

def my_tool(input: str) -> str:
    return process_input(input)

agent = Agent(tools=[my_tool])

# After (Pydantic AI)
from pydantic_ai import Agent
from pydantic import BaseModel

class MyInput(BaseModel):
    input: str

class MyOutput(BaseModel):
    result: str

def my_tool(input: MyInput) -> MyOutput:
    return MyOutput(result=process_input(input.input))

agent = Agent(tools=[my_tool])
```

### From TypeScript to Python

```typescript
// TypeScript
const tool = {
  name: "myTool",
  description: "Does something useful",
  execute: async (input: string) => {
    return await processInput(input);
  }
};
```

```python
# Python equivalent
def my_tool(input: str) -> str:
    """Does something useful"""
    return process_input(input)
```

## Getting Started

### 1. Choose Your Library
Based on your tech stack and requirements above.

### 2. Install Dependencies
Follow the installation instructions for your chosen library.

### 3. Implement Your First Pattern
Start with the [Tool Budget Pattern](../patterns/tool-budget.md):

- [TypeScript Example](../examples/tool-budget-openai-ts.md)
- Python Example (coming soon)
- Pydantic AI Example (coming soon)

### 4. Explore Advanced Patterns
Once you're comfortable with the basics, explore more complex patterns and combinations.

## Community & Support

### Library-Specific Resources

- **OpenAI Agent SDK**: [GitHub](https://github.com/openai/agent-sdk) | [Documentation](https://docs.openai.com/agent-sdk)
- **Pydantic AI**: [GitHub](https://github.com/pydantic/pydantic-ai) | [Documentation](https://pydantic.ai)

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