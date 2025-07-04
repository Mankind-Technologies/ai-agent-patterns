---
sidebar_position: 3
---

# Embedded Explaining Pattern

<div className="badges">
<span className="badge badge--agent">Observability</span>
<span className="badge badge--pattern">Decision Quality</span>
<span className="badge badge--tool">Transparency</span>
</div>

The Embedded Explaining Pattern requires AI agents to provide clear justification for each tool call, increasing observability and improving decision quality.

## Problem

AI agents often make tool calls without providing clear justification for their decisions. This creates several challenges:

- **Debugging Difficulty**: When agents make unexpected tool calls, it's hard to understand why
- **Trust Issues**: Users can't trust decisions they don't understand
- **Quality Concerns**: Agents may make thoughtless tool selections
- **Compliance Gaps**: Regulated industries often require decision explanations
- **Learning Barriers**: Humans can't learn from agent approaches without understanding the reasoning

## Solution

The Embedded Explaining Pattern adds a "why" parameter to tools that requires agents to explain:

1. **Goal**: What the agent is trying to achieve
2. **Justification**: Why this specific tool is the best choice
3. **Context**: What makes this tool call necessary right now
4. **Expected Outcome**: What the agent expects to accomplish

## Implementation

### Core Concept

```typescript
interface ExplainedToolInput<T> {
  // Original tool parameters
  ...T;
  // Added explanation requirement
  why: string;
}

function withExplanation<T extends Tool>(tool: T): ExplainedTool<T> {
  // Implementation wraps tool with explanation requirements
}
```

### Basic Example

```typescript
import { withExplanation } from './patterns/embedded-explaining';

// Original tool
const webScrapingTool = {
  name: "scrapeUrl",
  description: "Scrapes content from web URLs",
  execute: async (input: { url: string; topic: string }) => {
    const content = await scrapeWebsite(input.url);
    return {
      content,
      success: true,
      source: input.url
    };
  }
};

// Add explanation requirement
const explainedScraper = withExplanation(webScrapingTool);

// The description is automatically enhanced
console.log(explainedScraper.description);
// "Scrapes content from web URLs
// 
// [EXPLANATION REQUIRED] You must provide a clear explanation 
// of why this action is justified and what goal it serves."
```

### Usage with Explanations

```typescript
// Agent must now provide reasoning
const result = await explainedScraper.execute({
  url: "https://example.com/ai-news",
  topic: "AI developments",
  why: "Need current AI news since local knowledge may be outdated and user specifically asked for latest developments"
});

console.log(result);
// {
//   content: "Latest AI developments...",
//   success: true,
//   source: "https://example.com/ai-news"
// }
```

## Real-World Example

Here's how the pattern works in a research assistant scenario:

### Enhanced Tools Setup

```typescript
import { withExplanation } from './patterns/embedded-explaining';

// Free tool with explanation
const explainedLocalSearch = withExplanation({
  name: "localSearch",
  description: "Searches local knowledge base",
  execute: async (input: { query: string; why: string }) => {
    const results = await searchLocalKnowledge(input.query);
    return {
      results,
      source: "local-database"
    };
  }
});

// Expensive tool with explanation
const explainedWebScraper = withExplanation({
  name: "webScraper", 
  description: "Scrapes current web information",
  execute: async (input: { url: string; topic: string; why: string }) => {
    const content = await scrapeWebsite(input.url);
    return {
      content,
      source: input.url,
      processingTime: 2.1
    };
  }
});
```

### Agent with Explaining Tools

```typescript
const agent = new Agent({
  apiKey: process.env.OPENAI_API_KEY,
  tools: [explainedLocalSearch, explainedWebScraper],
  systemPrompt: `
    You are a research assistant. For every tool call, you must:
    
    1. Explain WHY you're using that specific tool
    2. What information you expect to find
    3. Why this tool is better than alternatives for this task
    4. How this fits your overall research strategy
    
    Be specific and thoughtful in your explanations.
  `
});

// Example conversation
const response = await agent.run(
  "What are the latest developments in quantum computing?"
);

// Agent would make calls like:
// localSearch({ 
//   query: "quantum computing basics", 
//   why: "First checking local knowledge for foundational context before seeking latest developments"
// })
// 
// webScraper({ 
//   url: "https://quantum-news.com", 
//   topic: "quantum computing",
//   why: "Local search provided good background but user specifically wants 'latest' developments which requires current web information"
// })
```

## Pattern Implementation

### Simple Implementation

```typescript
import { z } from "zod";

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
        console.log(`[explaining] Tool ${tool.name} called with explanation: "${input.why}"`);
        
        if (requireExplanation && (!input.why || input.why.trim().length === 0)) {
            console.log(`[explaining] Tool ${tool.name} called without required explanation`);
            return {
                error: "EXPLANATION_REQUIRED",
                message: "This tool requires an explanation of why it's being used. Please provide a 'why' parameter."
            };
        }
        
        console.log(`[explaining] Invoking tool ${tool.name}`);
        
        // Execute the original tool with the original parameters (excluding 'why')
        const { why, ...originalInput } = input;
        const result = await originalExecute(originalInput, context);
        
        console.log(`[explaining] Tool ${tool.name} completed.`);
        
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
    
    console.log(`[explaining] Tool ${tool.name} enhanced with explanation requirements`);
    return explainedTool;
}
```

## Key Benefits

### 1. **Enhanced Debugging**
```typescript
// When something goes wrong, you can see the reasoning
const failedCall = await explainedTool.execute({
  query: "obscure topic",
  why: "User asked for comprehensive information"
});

if (!failedCall.success) {
  console.log("Tool failed after reasoning:", failedCall.explanation);
  // Shows agent misunderstood that local search would be sufficient
}
```

### 2. **Quality Improvement**
```typescript
// Agents make better decisions when forced to explain
const betterDecision = await explainedTool.execute({
  query: "basic math",
  why: "This is fundamental information that should be in local knowledge, so web scraping would be wasteful"
});
// Agent chooses more appropriately when required to justify
```

### 3. **User Trust**
```typescript
// Users can see and understand agent reasoning
function displayAgentReasoning(result: any) {
  return `
    Agent used ${result.tool} because: ${result.explanation}
    Result: ${result.success ? 'Success' : 'Failed'}
  `;
}
```

## Advanced Configuration

### Custom Explanation Prompts

```typescript
const detailedExplainer = withExplanation(tool, {
  explanationPrompt: "Provide detailed justification including alternative approaches considered"
});

const simpleExplainer = withExplanation(tool, {
  explanationPrompt: "Brief reason for this choice"
});
```

### Optional Explanations

```typescript
const optionalExplanationTool = withExplanation(tool, {
  requireExplanation: false
});

// Tool can be called with or without explanation
await optionalExplanationTool.execute({
  query: "test",
  why: "Testing functionality"
});

await optionalExplanationTool.execute({
  query: "test"
  // No explanation required
});
```

## Integration with Other Patterns

### With Tool Budget Pattern

```typescript
const budgetedExplainedTool = withExplanation(
  budget(expensiveTool, { maxTimes: 3 })
);

// Agent must explain why expensive tool is worth using
await budgetedExplainedTool.execute({
  url: "https://premium-data.com",
  topic: "urgent research",
  why: "Critical deadline requires most current data available, justifying expensive premium source"
});
```

### With Retry Pattern

```typescript
const explainedRetryTool = withExplanation(
  withRetry(unreliableTool, { maxRetries: 3 })
);

// Explanations help understand why retries are happening
await explainedRetryTool.execute({
  data: "important",
  why: "User needs this data for critical decision - worth retrying if it fails"
});
```

## Best Practices

### 1. **Clear Explanation Requirements**
```typescript
const wellDefinedTool = withExplanation(tool, {
  explanationPrompt: `
    Explain:
    - What specific information you need
    - Why this tool is the best choice
    - What you expect to find
    - How this serves the user's goal
  `
});
```

### 2. **Contextual Prompting**
```typescript
const contextualTool = withExplanation(tool, {
  explanationPrompt: "Given the current conversation context, explain why this tool call is necessary and what specific outcome you're seeking"
});
```

### 3. **Integration with System Prompts**
```typescript
const agent = new Agent({
  tools: [explainedTool],
  systemPrompt: `
    You are a helpful assistant. When using tools:
    
    1. Always explain your reasoning in the 'why' parameter
    2. Be specific about what you're trying to achieve
    3. Mention why this tool is better than alternatives
    4. Keep explanations concise but informative
    
    Poor explanation: "Need information"
    Good explanation: "Need current stock prices since user asked for today's performance and local data would be outdated"
  `
});
```

## Common Use Cases

### 1. **Research Assistants**
```typescript
const researchTool = withExplanation(webSearchTool, {
  explanationPrompt: "Explain what information you're seeking and why web search is necessary over local knowledge"
});
```

### 2. **Customer Service**
```typescript
const supportTool = withExplanation(customerResolutionTool, {
  explanationPrompt: "Explain why this resolution approach is best for the customer's specific issue"
});
```

### 3. **Data Analysis**
```typescript
const analysisTool = withExplanation(dataProcessingTool, {
  explanationPrompt: "Explain what analysis you're performing and why it's relevant to the user's question"
});
```

## Troubleshooting

### Common Issues

#### Explanations Too Generic
```typescript
// Problem: Agent gives vague explanations
"why": "Need information"

// Solution: Use specific prompts
const improvedTool = withExplanation(tool, {
  explanationPrompt: "Be specific about what information you need and why this tool is the best choice"
});
```

#### Missing Strategic Context
```typescript
// Problem: Explanations don't show broader strategy
"why": "Need to search for cats"

// Solution: Guide strategic thinking
const strategicTool = withExplanation(tool, {
  explanationPrompt: "Explain your goal, why this tool fits your strategy, and what you expect to accomplish"
});
```

## Testing Explanations

```typescript
describe('Explanation Quality', () => {
  it('should require explanations when configured', async () => {
    const result = await explainedTool.execute({
      query: 'test'
      // Missing 'why' parameter
    });
    
    expect(result.error).toBe('EXPLANATION_REQUIRED');
  });
  
  it('should accept valid explanations', async () => {
    const result = await explainedTool.execute({
      query: 'test',
      why: 'Need to verify test functionality because user reported specific error with this feature'
    });
    
    expect(result.success).toBe(true);
  });
});
```

## Example Implementation

A simplified example implementation of this pattern is available in the repository:

📁 **[View on GitHub](https://github.com/Mankind-Technologies/ai-agent-patterns/tree/main/src/patterns/embeddedExplaining/openai-agent-sdk-ts)**

This implementation demonstrates the core concepts of the Embedded Explaining Pattern using the OpenAI Agent SDK for TypeScript. Note that this is a simplified example designed for educational purposes and may need adaptation for production use.

## Next Steps

1. **Implement the Pattern**: Start by adding explanations to your most critical tools
2. **Monitor Quality**: Track how explanations help with debugging and trust
3. **Iterate on Prompts**: Refine explanation prompts based on real usage
4. **Expand Coverage**: Add explanations to more tools based on value

## Related Patterns

- [Tool Budget Pattern](./tool-budget.md) - Combine explanations with cost justification

*Additional patterns for audit, retry logic, and decision trees are planned for future implementation.* 