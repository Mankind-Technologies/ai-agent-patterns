# AI Agent Pattern: Tool Budget

There are tools that may implicate a cost, being time, money, credits, or any other metric.

The goal of an agent should be to use the tools as efficiently as possible to reach its instructed goal. However, when something can be done with multiple tools, and where the cost may be complicated, communicating the cost to an agent may be complicated.

This pattern is a hard limit spending that intends to be communicative with the agent, to let the agent decide how and when to use a potentially expensive tool.

## Why This Pattern Matters

In real-world AI applications, agents often have access to both expensive and free operations:
- **Expensive**: Web scraping, API calls, image generation, large file processing
- **Free**: Local searches, cached data, simple calculations, text analysis

Without budget constraints, an agent might:
- Use expensive tools unnecessarily when free alternatives exist
- Exhaust resources on low-priority tasks
- Fail to complete important tasks due to resource depletion

## The Research Assistant Example

Our example demonstrates a research assistant with two types of tools:

1. **Web Scraping** (Limited to 3 uses)
   - Simulates expensive network operations
   - Provides latest information from external sources
   - Takes time and resources to process

2. **Local Search** (Unlimited)
   - Searches through local knowledge base
   - Instant responses with no cost
   - Good for basic concepts and known information

## Key Benefits Demonstrated

1. **Strategic Decision Making**: The agent learns to try free options first
2. **Resource Conservation**: Expensive tools are saved for when they're truly needed
3. **Transparency**: Both agent and user understand resource constraints
4. **Graceful Degradation**: When budget is exhausted, the agent adapts its approach

## Pattern Implementation

```js
interface ScrapeUrlToolInput {
    url: string;
    topic: string;
}

interface ScrapeUrlToolOutput {
    content: string;
    success: boolean;
    source: string;
    processingTime: number;
}

const scrapeUrlTool = {
    name: "scrapeUrlTool",
    description: "Used to gather latest data from a URL",
    execute: (input: ScrapeUrlToolInput): ScrapeUrlToolOutput => {
        const url = input.url;
        // ... some expensive code (network requests, parsing, etc.)
        return { content: "...", success: true, source: url, processingTime: 2.1 };
    }
}

const budgetedScrapeUrlTool = budget(scrapeUrlTool, {maxTimes: 3});
console.log(budgetedScrapeUrlTool.description);
// Used to gather latest data from a URL
// 
// [BUDGET CONSTRAINT] This tool can be used 3 times maximum. After that, it will return a failure. Use strategically as it represents expensive operations.

const output1 = await budgetedScrapeUrlTool.execute({url: "https://...", topic: "javascript"});
console.log(output1);
// { content: "...", success: true, source: "https://...", processingTime: 2.1, budget: "This tool can be used 2 more times" }

const output2 = await budgetedScrapeUrlTool.execute({url: "https://...", topic: "react"});
console.log(output2);
// { content: "...", success: true, source: "https://...", processingTime: 1.8, budget: "This tool can be used 1 more times" }

const output3 = await budgetedScrapeUrlTool.execute({url: "https://...", topic: "python"});
console.log(output3);
// { content: "...", success: true, source: "https://...", processingTime: 2.3, budget: "This tool can be used 0 more times" }

const output4 = await budgetedScrapeUrlTool.execute({url: "https://...", topic: "ai"});
console.log(output4);
// { budget: "This tool cannot be used anymore. Consider using local search instead." }
```

## Running the Example

The example in `openai-agent-sdk-ts/index.ts` shows how an agent strategically handles multiple research queries:

1. First queries use local search (free)
2. Agent only uses web scraping when it determines the information needs to be more current
3. Once budget is exhausted, agent gracefully falls back to local alternatives
4. User sees clear feedback about resource usage and constraints

This demonstrates real-world value: preventing runaway costs while maintaining functionality.

## Real-World Applications

- **Content Generation**: Limit expensive AI image/video generation while allowing unlimited text processing
- **Data Analysis**: Restrict expensive API calls while allowing local data queries
- **Research Tools**: Balance between expensive live web scraping and free cached results
- **Development Tools**: Limit costly cloud operations while allowing local builds/tests
