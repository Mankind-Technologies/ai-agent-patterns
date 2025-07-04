---
sidebar_position: 2
---

# OpenAI Agent SDK (TypeScript)

<div className="badges">
<span className="badge badge--agent">TypeScript</span>
<span className="badge badge--tool">Web Applications</span>
<span className="badge badge--pattern">Full Support</span>
</div>

The OpenAI Agent SDK for TypeScript provides a modern, type-safe way to build AI agents with full pattern support.

## Overview

The TypeScript SDK is perfect for:
- **Web Applications**: React, Next.js, Vue.js applications
- **Serverless Functions**: AWS Lambda, Vercel Functions
- **Node.js APIs**: Express, Fastify, Koa applications
- **Desktop Applications**: Electron apps

## Installation

```bash
npm install openai-agent-sdk
# or
yarn add openai-agent-sdk
# or
pnpm add openai-agent-sdk
```

### TypeScript Configuration

Ensure your `tsconfig.json` includes:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "moduleResolution": "node",
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

## Quick Start

### Basic Agent Setup

```typescript
import { Agent } from 'openai-agent-sdk';

const agent = new Agent({
  apiKey: process.env.OPENAI_API_KEY,
  model: 'gpt-4',
  tools: [
    // Your tools here
  ]
});

const response = await agent.run('Hello, world!');
console.log(response);
```

### Creating Tools

```typescript
interface WeatherInput {
  location: string;
  unit?: 'celsius' | 'fahrenheit';
}

interface WeatherOutput {
  temperature: number;
  description: string;
  unit: string;
}

const weatherTool = {
  name: 'getWeather',
  description: 'Get current weather for a location',
  execute: async (input: WeatherInput): Promise<WeatherOutput> => {
    // Implementation
    const weather = await fetchWeather(input.location);
    return {
      temperature: weather.temp,
      description: weather.description,
      unit: input.unit || 'celsius'
    };
  }
};

const agent = new Agent({
  apiKey: process.env.OPENAI_API_KEY,
  tools: [weatherTool]
});
```

## Pattern Implementation

### Tool Budget Pattern

```typescript
import { budget } from '@ai-agent-patterns/tool-budget';

// Create an expensive tool
const webScrapingTool = {
  name: 'scrapeWebsite',
  description: 'Scrape content from a website',
  execute: async (input: { url: string }) => {
    // Expensive operation
    const content = await scrapeWebsite(input.url);
    return { content, success: true };
  }
};

// Apply budget constraints
const budgetedScraper = budget(webScrapingTool, {
  maxTimes: 3,
  resetPeriod: 'day'
});

// Use with agent
const agent = new Agent({
  apiKey: process.env.OPENAI_API_KEY,
  tools: [budgetedScraper]
});
```

### Error Handling

```typescript
const robustTool = {
  name: 'robustTool',
  description: 'A tool with proper error handling',
  execute: async (input: any) => {
    try {
      const result = await performOperation(input);
      return { success: true, data: result };
    } catch (error) {
      console.error('Tool execution failed:', error);
      return { 
        success: false, 
        error: error.message,
        fallback: 'Try using a different approach'
      };
    }
  }
};
```

## Advanced Features

### Streaming Responses

```typescript
const agent = new Agent({
  apiKey: process.env.OPENAI_API_KEY,
  stream: true
});

const stream = await agent.stream('Generate a long story');

for await (const chunk of stream) {
  process.stdout.write(chunk);
}
```

### Custom Configuration

```typescript
const agent = new Agent({
  apiKey: process.env.OPENAI_API_KEY,
  model: 'gpt-4-turbo',
  temperature: 0.7,
  maxTokens: 2000,
  timeout: 30000,
  retries: 3,
  tools: [
    // Your tools
  ]
});
```

### Tool Validation

```typescript
import { z } from 'zod';

const inputSchema = z.object({
  query: z.string().min(1).max(1000),
  category: z.enum(['general', 'technical', 'creative'])
});

const validatedTool = {
  name: 'searchTool',
  description: 'Search for information',
  inputSchema,
  execute: async (input: z.infer<typeof inputSchema>) => {
    // Input is automatically validated
    const results = await search(input.query, input.category);
    return { results };
  }
};
```

## Integration Examples

### Next.js API Route

```typescript
// pages/api/agent.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { Agent } from 'openai-agent-sdk';

const agent = new Agent({
  apiKey: process.env.OPENAI_API_KEY,
  tools: [/* your tools */]
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message } = req.body;
    const response = await agent.run(message);
    res.status(200).json({ response });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
}
```

### React Component

```typescript
import React, { useState } from 'react';
import { Agent } from 'openai-agent-sdk';

const ChatComponent: React.FC = () => {
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const agent = new Agent({
    apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
    tools: [/* your tools */]
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await agent.run(input);
      setMessages([...messages, `You: ${input}`, `Agent: ${response}`]);
      setInput('');
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div>
        {messages.map((msg, i) => (
          <div key={i}>{msg}</div>
        ))}
      </div>
      <form onSubmit={handleSubmit}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Thinking...' : 'Send'}
        </button>
      </form>
    </div>
  );
};
```

### Express.js Server

```typescript
import express from 'express';
import { Agent } from 'openai-agent-sdk';

const app = express();
app.use(express.json());

const agent = new Agent({
  apiKey: process.env.OPENAI_API_KEY,
  tools: [/* your tools */]
});

app.post('/chat', async (req, res) => {
  try {
    const { message } = req.body;
    const response = await agent.run(message);
    res.json({ response });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
```

## Best Practices

### 1. Environment Variables

```typescript
// .env.local
OPENAI_API_KEY=your-api-key-here

// In your code
const agent = new Agent({
  apiKey: process.env.OPENAI_API_KEY!,
  // ... other config
});
```

### 2. Error Handling

```typescript
const safeAgent = {
  async run(message: string) {
    try {
      return await agent.run(message);
    } catch (error) {
      if (error.code === 'rate_limit_exceeded') {
        return 'I\'m currently busy. Please try again in a moment.';
      }
      throw error;
    }
  }
};
```

### 3. Type Safety

```typescript
interface CustomTool {
  name: string;
  description: string;
  execute: (input: any) => Promise<any>;
}

const typedTools: CustomTool[] = [
  weatherTool,
  calculatorTool,
  // TypeScript will ensure all tools match the interface
];
```

### 4. Testing

```typescript
import { describe, it, expect } from 'vitest';
import { Agent } from 'openai-agent-sdk';

describe('Agent Tests', () => {
  it('should respond to basic queries', async () => {
    const agent = new Agent({
      apiKey: 'test-key',
      tools: []
    });

    const response = await agent.run('Hello');
    expect(response).toBeDefined();
  });
});
```

## Troubleshooting

### Common Issues

#### API Key Not Found
```typescript
// Problem: API key not set
const agent = new Agent({
  apiKey: undefined // This will fail
});

// Solution: Check environment variables
const agent = new Agent({
  apiKey: process.env.OPENAI_API_KEY || 'fallback-key'
});
```

#### Tool Execution Errors
```typescript
// Problem: Unhandled tool errors
const problematicTool = {
  execute: async (input) => {
    return await riskyOperation(input); // Might throw
  }
};

// Solution: Wrap in try-catch
const safeTool = {
  execute: async (input) => {
    try {
      return await riskyOperation(input);
    } catch (error) {
      return { error: error.message };
    }
  }
};
```

#### Memory Issues
```typescript
// Problem: Large objects in memory
const heavyTool = {
  execute: async (input) => {
    const largeResult = await processLargeData(input);
    return largeResult; // This might cause memory issues
  }
};

// Solution: Stream or paginate results
const streamingTool = {
  execute: async (input) => {
    const stream = await processLargeDataStream(input);
    return { stream: stream.iterator() };
  }
};
```

## Performance Optimization

### 1. Tool Caching

```typescript
import { LRUCache } from 'lru-cache';

const cache = new LRUCache<string, any>({
  max: 100,
  ttl: 1000 * 60 * 5 // 5 minutes
});

const cachedTool = {
  name: 'cachedTool',
  execute: async (input: any) => {
    const key = JSON.stringify(input);
    
    if (cache.has(key)) {
      return cache.get(key);
    }
    
    const result = await expensiveOperation(input);
    cache.set(key, result);
    return result;
  }
};
```

### 2. Parallel Tool Execution

```typescript
const parallelTools = {
  name: 'parallelSearch',
  execute: async (input: { queries: string[] }) => {
    const results = await Promise.all(
      input.queries.map(query => searchTool.execute({ query }))
    );
    return { results };
  }
};
```

## Next Steps

1. **Implement Your First Pattern**: Start with the [Tool Budget Pattern](../patterns/tool-budget.md)
2. **Explore Examples**: Check out [working examples](../examples/tool-budget-openai-ts.md)
3. **Join the Community**: Share your experiences and get help
4. **Contribute**: Help improve the TypeScript SDK implementation

## Related Resources

- [OpenAI Agent SDK Documentation](https://docs.openai.com/agent-sdk)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tool Budget Pattern Examples](../examples/tool-budget-openai-ts.md)
- [Embedded Explaining Pattern Examples](../examples/embedded-explaining-openai-ts.md) 