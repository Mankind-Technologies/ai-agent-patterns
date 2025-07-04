---
sidebar_position: 2
---

# Tool Budget Pattern

<div className="badges">
<span className="badge badge--tool">Resource Management</span>
<span className="badge badge--budget">Cost Control</span>
<span className="badge badge--agent">Production Ready</span>
</div>

The Tool Budget Pattern implements hard limits on expensive tool usage while maintaining agent effectiveness through strategic resource management.

## Problem

AI agents often have access to both expensive and free operations:

- **Expensive**: Web scraping, API calls, image generation, large file processing
- **Free**: Local searches, cached data, simple calculations, text analysis

Without budget constraints, agents might:
- Use expensive tools unnecessarily when free alternatives exist
- Exhaust resources on low-priority tasks
- Fail to complete important tasks due to resource depletion

## Solution

The Tool Budget Pattern wraps expensive tools with usage constraints, providing:

1. **Hard Limits**: Maximum number of uses per tool
2. **Clear Communication**: Agents understand resource constraints
3. **Graceful Degradation**: Fallback behavior when budget is exhausted
4. **Strategic Decision Making**: Agents learn to prioritize tool usage

## Implementation

### Core Concept

```typescript
interface BudgetConstraints {
  maxTimes: number;
  currentUsage?: number;
  resetPeriod?: 'hour' | 'day' | 'week' | 'month';
}

function budget<T extends Tool>(
  tool: T, 
  constraints: BudgetConstraints
): BudgetedTool<T> {
  // Implementation wraps the tool with budget logic
}
```

### TypeScript Example

```typescript
import { budget } from './patterns/tool-budget';

// Original expensive tool
const webScrapingTool = {
  name: "scrapeUrlTool",
  description: "Used to gather latest data from a URL",
  execute: async (input: { url: string; topic: string }) => {
    // Expensive network operation
    const content = await scrapeWebsite(input.url);
    return {
      content,
      success: true,
      source: input.url,
      processingTime: 2.1
    };
  }
};

// Apply budget constraints
const budgetedScraper = budget(webScrapingTool, { 
  maxTimes: 3 
});

// The description is automatically enhanced
console.log(budgetedScraper.description);
// "Used to gather latest data from a URL
// 
// [BUDGET CONSTRAINT] This tool can be used 3 times maximum. 
// After that, it will return a failure. Use strategically as 
// it represents expensive operations."
```

### Python Example

```python
from patterns.tool_budget import budget

@budget(max_times=3)
def expensive_web_scraper(url: str, topic: str) -> dict:
    """Scrapes web content - limited to 3 uses."""
    content = scrape_website(url)
    return {
        'content': content,
        'success': True,
        'source': url,
        'processing_time': 2.1
    }

# Usage tracking is automatic
result1 = expensive_web_scraper("https://example.com", "AI")
print(result1['budget'])  # "This tool can be used 2 more times"

result2 = expensive_web_scraper("https://example.com", "ML")
print(result2['budget'])  # "This tool can be used 1 more times"

result3 = expensive_web_scraper("https://example.com", "Python")
print(result3['budget'])  # "This tool can be used 0 more times"

# Budget exhausted
result4 = expensive_web_scraper("https://example.com", "AI")
print(result4['budget'])  # "This tool cannot be used anymore. Consider using local search instead."
```

## Real-World Example

Here's how the pattern works in a research assistant scenario:

### The Setup

```typescript
// Free tool - unlimited usage
const localSearchTool = {
  name: "localSearch",
  description: "Searches local knowledge base",
  execute: async (query: string) => {
    return { content: searchLocalKnowledge(query), cost: 0 };
  }
};

// Expensive tool - limited usage
const webScrapingTool = budget({
  name: "webScraper",
  description: "Scrapes current web information",
  execute: async (url: string) => {
    return { content: await scrapeWebsite(url), cost: 5 };
  }
}, { maxTimes: 3 });
```

### Agent Behavior

```typescript
// Agent receives multiple research requests
const researchQueries = [
  "What is machine learning?",
  "Latest AI developments in 2024",
  "Python programming basics",
  "Current stock market trends"
];

// Agent strategy:
// 1. Try local search first (free)
// 2. Use web scraping only for time-sensitive queries
// 3. Conserve budget for most important tasks

for (const query of researchQueries) {
  // Always try local search first
  const localResult = await localSearchTool.execute(query);
  
  if (localResult.content && isContentSufficient(localResult.content)) {
    // Local search was sufficient
    continue;
  }
  
  // Determine if web scraping is worth the budget
  if (isTimeSensitive(query) && webScrapingTool.hasUsagesLeft()) {
    const webResult = await webScrapingTool.execute(getUrlForQuery(query));
    // Budget automatically decremented
  } else {
    // Fall back to local search or inform user of limitations
    handleBudgetExhausted(query);
  }
}
```

## Key Benefits

### 1. **Cost Control**
- Prevents runaway expenses in production
- Provides predictable resource usage
- Enables budget planning and forecasting

### 2. **Strategic Decision Making**
- Agents learn to prioritize tool usage
- Encourages efficient resource allocation
- Promotes use of free alternatives when possible

### 3. **Transparency**
- Clear communication of resource constraints
- Visible budget status in tool responses
- Audit trail of tool usage

### 4. **Graceful Degradation**
- System continues functioning when budget is exhausted
- Fallback mechanisms maintain service availability
- User experience degrades gracefully, not catastrophically

## Configuration Options

### Basic Configuration

```typescript
const budgetedTool = budget(tool, {
  maxTimes: 10,           // Maximum uses
  resetPeriod: 'day',     // Reset frequency
  warningThreshold: 0.8   // Warn when 80% used
});
```

### Advanced Configuration

```typescript
const budgetedTool = budget(tool, {
  maxTimes: 50,
  resetPeriod: 'hour',
  
  // Custom budget exhausted message
  exhaustedMessage: "API quota exceeded. Try again next hour.",
  
  // Cost per use (for tracking)
  costPerUse: 0.10,
  
  // Fallback suggestions
  fallbackSuggestions: [
    "Use local search for basic information",
    "Try cached results if available"
  ]
});
```

## Best Practices

### 1. **Start Conservative**
Begin with lower limits and increase based on actual usage patterns.

```typescript
// Start with minimal budget
const budgetedTool = budget(expensiveTool, { maxTimes: 5 });

// Monitor usage and adjust
// budgetedTool.updateBudget({ maxTimes: 10 });
```

### 2. **Provide Clear Fallbacks**
Always offer alternatives when the budget is exhausted.

```typescript
const budgetedTool = budget(webScraper, {
  maxTimes: 3,
  fallbackSuggestions: [
    "Search local knowledge base",
    "Use cached results from previous queries",
    "Wait for budget reset in 1 hour"
  ]
});
```

### 3. **Monitor and Alert**
Set up monitoring to track budget usage patterns.

```typescript
const budgetedTool = budget(tool, {
  maxTimes: 10,
  onBudgetWarning: (remaining) => {
    console.warn(`Only ${remaining} uses remaining`);
  },
  onBudgetExhausted: () => {
    console.error('Budget exhausted - consider increasing limits');
  }
});
```

### 4. **Reset Periods**
Choose appropriate reset periods based on your use case.

```typescript
// For high-frequency applications
const hourlyBudget = budget(tool, { 
  maxTimes: 100, 
  resetPeriod: 'hour' 
});

// For cost-sensitive applications
const dailyBudget = budget(tool, { 
  maxTimes: 10, 
  resetPeriod: 'day' 
});
```

## Common Use Cases

### 1. **API Rate Limiting**
```typescript
const apiTool = budget(externalApiCall, {
  maxTimes: 1000,
  resetPeriod: 'hour'
});
```

### 2. **Content Generation**
```typescript
const imageGenerator = budget(aiImageTool, {
  maxTimes: 10,
  resetPeriod: 'day',
  costPerUse: 0.50
});
```

### 3. **Data Processing**
```typescript
const heavyProcessor = budget(dataAnalysisTool, {
  maxTimes: 5,
  resetPeriod: 'hour',
  warningThreshold: 0.6
});
```

### 4. **Web Scraping**
```typescript
const webScraper = budget(scrapingTool, {
  maxTimes: 50,
  resetPeriod: 'day',
  respectRateLimit: true
});
```

## Integration with Agent Frameworks

### OpenAI Agent SDK (TypeScript)
```typescript
import { Agent } from 'openai-agent-sdk';
import { budget } from './patterns/tool-budget';

const agent = new Agent({
  tools: [
    budget(webScrapingTool, { maxTimes: 3 }),
    localSearchTool  // No budget needed for free tools
  ]
});
```

### Pydantic AI
```python
from pydantic_ai import Agent
from patterns.tool_budget import budget

agent = Agent(
    tools=[
        budget(web_scraping_tool, max_times=3),
        local_search_tool
    ]
)
```

## Troubleshooting

### Common Issues

#### Budget Exhausted Too Quickly
```typescript
// Problem: Budget runs out too fast
const problematicTool = budget(tool, { maxTimes: 1 });

// Solution: Increase budget or add reset period
const improvedTool = budget(tool, { 
  maxTimes: 10, 
  resetPeriod: 'hour' 
});
```

#### Agent Not Using Budget Wisely
```typescript
// Solution: Provide better tool descriptions
const betterTool = budget(tool, {
  maxTimes: 5,
  description: "Use only for time-sensitive information that can't be found locally"
});
```

#### Missing Fallback Behavior
```typescript
// Solution: Configure fallback suggestions
const completeeTool = budget(tool, {
  maxTimes: 3,
  fallbackSuggestions: [
    "Try local search first",
    "Use cached results",
    "Wait for budget reset"
  ]
});
```

## Next Steps

1. **Implement the Pattern**: Start with the [OpenAI TypeScript example](../examples/tool-budget-openai-ts.md)
2. **Monitor Usage**: Track how agents use budgeted tools
3. **Optimize Budgets**: Adjust limits based on real usage patterns
4. **Explore Combinations**: Combine with other patterns for advanced scenarios

## Related Patterns

- **Rate Limiting Pattern**: Control request frequency
- **Caching Pattern**: Reduce redundant operations
- **Fallback Chain Pattern**: Provide alternative tools when budget is exhausted
- **Usage Tracking Pattern**: Monitor and analyze tool usage patterns 