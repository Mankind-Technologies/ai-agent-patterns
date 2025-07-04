---
sidebar_position: 2
---

# Embedded Explaining Pattern - OpenAI Agent SDK (TypeScript)

<div className="badges">
<span className="badge badge--agent">TypeScript</span>
<span className="badge badge--tool">Observability</span>
<span className="badge badge--pattern">Decision Quality</span>
</div>

This example demonstrates the Embedded Explaining Pattern using the OpenAI Agent SDK for TypeScript, showing how to require agents to explain their tool usage decisions for better transparency and debugging.

## Complete Working Example

Here's a complete research assistant that uses the Embedded Explaining Pattern to provide clear justification for each tool call:

```typescript title="research-assistant-with-explaining.ts"
import { Agent } from 'openai-agent-sdk';
import { withExplanation } from './patterns/embedded-explaining';
import { z } from 'zod';

// Interface definitions
interface ScrapeInput {
  url: string;
  topic: string;
}

interface ScrapeOutput {
  content: string;
  success: boolean;
  source: string;
  processingTime: number;
}

interface SearchInput {
  query: string;
  category?: string;
}

interface SearchOutput {
  results: string[];
  source: string;
  confidence: number;
}

// Free tool - local search
const localSearchTool = {
  name: 'localSearch',
  description: 'Searches through local knowledge base for information. Fast and free.',
  parameters: z.object({
    query: z.string().describe('The search query to look for'),
    category: z.string().optional().describe('Optional category to narrow search')
  }),
  execute: async (input: SearchInput): Promise<SearchOutput> => {
    console.log(`🔍 Searching locally for: ${input.query}`);
    
    // Simulate local search
    const mockResults = [
      `Local information about ${input.query}`,
      `Cached data related to ${input.query}`,
      `Historical context for ${input.query}`
    ];
    
    return {
      results: mockResults,
      source: 'local-knowledge-base',
      confidence: 0.8
    };
  }
};

// Expensive tool - web scraping
const webScrapingTool = {
  name: 'scrapeUrl',
  description: 'Scrapes content from web URLs to get latest information. Expensive operation.',
  parameters: z.object({
    url: z.string().describe('The URL to scrape'),
    topic: z.string().describe('The specific topic to focus on while scraping')
  }),
  execute: async (input: ScrapeInput): Promise<ScrapeOutput> => {
    console.log(`🌐 Scraping ${input.url} for topic: ${input.topic}`);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const mockContent = `
      Latest information about ${input.topic} from ${input.url}:
      - Current trends and developments
      - Recent news and updates
      - Real-time data and statistics
      - Expert opinions and analysis
    `;
    
    return {
      content: mockContent,
      success: true,
      source: input.url,
      processingTime: 2.1
    };
  }
};

// Apply explanation requirements to both tools
const explainedLocalSearch = withExplanation(localSearchTool);
const explainedWebScraper = withExplanation(webScrapingTool);

// Create the agent with explained tools
const researchAgent = new Agent({
  apiKey: process.env.OPENAI_API_KEY!,
  model: 'gpt-4',
  tools: [explainedLocalSearch, explainedWebScraper],
  systemPrompt: `
    You are a research assistant with access to two tools:
    1. localSearch - Fast local knowledge base search
    2. scrapeUrl - Web scraping for latest information (expensive)
    
    For EVERY tool call, you MUST provide a clear explanation in the 'why' parameter that includes:
    - What specific goal you're trying to achieve
    - Why this particular tool is the best choice for this task
    - What you expect to find or accomplish
    - How this fits into your overall research strategy
    
    Be thoughtful and specific in your explanations. Users need to understand your reasoning.
  `
});

// Example usage showing explained tool calls
async function demonstrateExplainedToolUsage() {
  console.log('🤖 Starting Embedded Explaining Pattern demonstration\n');
  
  const queries = [
    'What are the basic concepts of machine learning?',
    'What are the latest AI developments in 2024?',
    'Tell me about recent breakthroughs in quantum computing',
    'How has the stock market performed this week?'
  ];
  
  for (const [index, query] of queries.entries()) {
    console.log(`\n📋 Query ${index + 1}: "${query}"`);
    console.log('=' .repeat(50));
    
    try {
      const response = await researchAgent.run(query);
      console.log(`\n💬 Final Response:\n${response.substring(0, 300)}...`);
    } catch (error) {
      console.error(`❌ Error: ${error.message}`);
    }
    
    // Add delay between queries
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

// Run the demonstration
demonstrateExplainedToolUsage().catch(console.error);
```

## Pattern Implementation

### Step 1: Define the Explaining Pattern

```typescript title="patterns/embedded-explaining.ts"
import { z } from "zod";

const log = true;
const logger = (message: string) => log && console.log(message);

export interface ExplainingOptions {
    requireExplanation?: boolean;
    explanationPrompt?: string;
}

export function withExplanation(tool: any, options: ExplainingOptions = {}) {
    const {
        requireExplanation = true,
        explanationPrompt = "Explain why this action is justified and what goal it serves"
    } = options;
    
    const originalExecute = tool.execute;
    
    const execute = async (input: any, context: unknown) => {
        logger(`[explaining] Tool ${tool.name} called with explanation: "${input.why}"`);
        
        if (requireExplanation && (!input.why || input.why.trim().length === 0)) {
            logger(`[explaining] Tool ${tool.name} called without required explanation`);
            return {
                error: "EXPLANATION_REQUIRED",
                message: "This tool requires an explanation of why it's being used. Please provide a 'why' parameter."
            };
        }
        
        logger(`[explaining] Invoking tool ${tool.name}`);
        
        // Execute the original tool with the original parameters (excluding 'why')
        const { why, ...originalInput } = input;
        const result = await originalExecute(originalInput, context);
        
        logger(`[explaining] Tool ${tool.name} completed.`);
        
        return result;
    };
    
    // Add the why parameter to the tool
    const newParameters = tool.parameters.extend({
        why: z.string().describe(explanationPrompt)
    });
    
    // Create a new tool object with enhanced description
    const explainedTool = {
        ...tool,
        parameters: newParameters,
        execute,
        description: `${tool.description} \n\n[EXPLANATION REQUIRED] You must provide a clear explanation of why this action is justified and what goal it serves. Include a 'why' parameter with your reasoning.`
    };
    
    logger(`[explaining] Tool ${tool.name} enhanced with explanation requirements`);
    return explainedTool;
}
```

### Step 2: Tool Enhancement Process

When you wrap a tool with `withExplanation()`, several things happen:

1. **Description Enhancement**: The tool description gets an explanation requirement notice
2. **Parameter Addition**: A required `why` parameter is added to the tool schema
3. **Execution Wrapping**: The execute function is wrapped to handle explanations
4. **Validation**: Ensures explanations are provided before tool execution

```typescript
// Before: Original tool
const originalTool = {
  name: "searchWeb",
  description: "Searches the web for information",
  parameters: z.object({
    query: z.string()
  }),
  execute: async (input) => ({ results: [...] })
};

// After: Explained tool
const explainedTool = withExplanation(originalTool);

console.log(explainedTool.description);
// "Searches the web for information
// 
// [EXPLANATION REQUIRED] You must provide a clear explanation..."

console.log(explainedTool.parameters.shape);
// { query: ZodString, why: ZodString }
```

### Step 3: Agent Usage Patterns

The pattern encourages agents to be more thoughtful about tool selection:

```typescript
// Agent call example - the AI must now explain each tool use
const result = await explainedSearchTool.execute({
  query: "latest AI developments",
  why: "User asked for latest AI news and local knowledge may be outdated. Web search will provide current information that's more relevant than cached data."
});

// Tool executes normally after validation
console.log(result);
// {
//   results: [...]
// }
```

## Real-World Tool Call Examples

### Example 1: Research Strategy Decision

```
Query: "What are the latest developments in quantum computing?"

Agent's tool call:
{
  "name": "localSearch",
  "parameters": {
    "query": "quantum computing basics",
    "why": "Starting with local search to establish foundational context about quantum computing before seeking latest developments. This ensures I understand the field well enough to evaluate and present new information effectively."
  }
}

Result shows the agent's strategic thinking about information gathering.
```

### Example 2: Escalation Justification

```
Follow-up tool call:
{
  "name": "scrapeUrl", 
  "parameters": {
    "url": "https://quantum-journal.com/recent",
    "topic": "quantum computing breakthroughs",
    "why": "Local search provided good background but user specifically requested 'latest' developments. Recent breakthroughs require current web information since quantum computing is rapidly evolving and my training data may miss recent discoveries."
  }
}

Shows clear escalation reasoning from local to web search.
```

### Example 3: Cost-Conscious Decision

```
Query: "What is machine learning?"

Agent's tool call:
{
  "name": "localSearch",
  "parameters": {
    "query": "machine learning definition concepts",
    "why": "This is a foundational question about well-established concepts. Local knowledge base should have comprehensive coverage of ML basics, making expensive web scraping unnecessary for this educational query."
  }
}

Demonstrates thoughtful resource management.
```

## Pattern Benefits in Practice

### 1. **Debugging Made Easy**
When an agent makes an unexpected tool choice, the explanation immediately reveals the reasoning:

```
❌ Problem: Agent used expensive web scraping for basic question
🔍 Explanation: "User asked about 'current' machine learning, interpreting this as need for latest ML developments rather than basic concepts"
✅ Solution: Adjust prompt to clarify when 'current' means 'latest' vs 'contemporary'
```

### 2. **Quality Improvement**
Requiring explanations forces agents to be more deliberate:

```
Without explanation: Random tool selection
With explanation: "Using local search first because this appears to be a foundational question that doesn't require latest information"
```

### 3. **Trust and Transparency**
Users can follow the agent's reasoning process:

```
User: "Why did you search the web instead of using local data?"
Agent explanation: "You asked about 'this week's' stock performance. Local data is likely outdated for such time-sensitive financial information."
```

## Advanced Usage

### Custom Explanation Requirements

```typescript
const detailedExplainer = withExplanation(tool, {
  explanationPrompt: "Provide detailed justification including alternative approaches considered"
});

const simpleExplainer = withExplanation(tool, {
  explanationPrompt: "Brief reason for this choice"
});
```

### Integration with Other Patterns

```typescript
// Combine with Tool Budget pattern
const budgetedAndExplained = budget(
  withExplanation(expensiveTool), 
  { maxTimes: 3, resetPeriod: 'day' }
);

// Agent must explain why expensive tool is worth using
await budgetedAndExplained.execute({
  url: "https://premium-data.com",
  topic: "urgent research",
  why: "Critical deadline requires most current data available, justifying expensive premium source"
});
```

## Running the Example

1. Install dependencies:
```bash
npm install openai-agent-sdk zod
```

2. Set your OpenAI API key:
```bash
export OPENAI_API_KEY="your-api-key-here"
```

3. Run the example:
```bash
npx ts-node research-assistant-with-explaining.ts
```

You'll see output like:
```
🤖 Starting Embedded Explaining Pattern demonstration

📋 Query 1: "What are the basic concepts of machine learning?"
==================================================
[explaining] Tool localSearch called with explanation: "This is a foundational question about well-established ML concepts. Local knowledge should have comprehensive coverage without needing current web data."

💬 Final Response: Machine learning is a subset of artificial intelligence...
```

This pattern transforms opaque agent behavior into transparent, explainable decision-making, making AI agents more trustworthy and easier to debug. 