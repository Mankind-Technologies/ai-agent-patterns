---
sidebar_position: 1
---

# Tool Budget Pattern - OpenAI Agent SDK (TypeScript)

<div className="badges">
<span className="badge badge--agent">TypeScript</span>
<span className="badge badge--tool">Resource Management</span>
<span className="badge badge--budget">Cost Control</span>
</div>

This example demonstrates the Tool Budget Pattern using the OpenAI Agent SDK for TypeScript, showing how to control costs while maintaining agent effectiveness.

## Complete Working Example

Here's a complete research assistant that uses the Tool Budget Pattern to manage expensive web scraping operations:

```typescript title="research-assistant.ts"
import { Agent } from 'openai-agent-sdk';
import { budget } from './patterns/tool-budget';

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
  budget?: string;
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

// Free tool - unlimited usage
const localSearchTool = {
  name: 'localSearch',
  description: 'Searches through local knowledge base for information. Free to use and fast.',
  execute: async (input: SearchInput): Promise<SearchOutput> => {
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

// Expensive tool - will be budget-constrained
const webScrapingTool = {
  name: 'scrapeUrl',
  description: 'Scrapes content from web URLs to get latest information. Expensive operation.',
  execute: async (input: ScrapeInput): Promise<ScrapeOutput> => {
    // Simulate expensive web scraping
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

// Apply budget constraints to the expensive tool
const budgetedScraper = budget(webScrapingTool, {
  maxTimes: 3,
  resetPeriod: 'day'
});

// Create the agent with both tools
const researchAgent = new Agent({
  apiKey: process.env.OPENAI_API_KEY!,
  model: 'gpt-4',
  tools: [localSearchTool, budgetedScraper],
  systemPrompt: `
    You are a research assistant with access to two tools:
    1. localSearch - Free, unlimited searches through local knowledge
    2. scrapeUrl - Limited to 3 uses per day, expensive but provides latest information
    
    Strategy:
    - Always try local search first for basic information
    - Use web scraping only for time-sensitive or very recent information
    - Conserve your scraping budget for the most important queries
    - Inform users when you're using limited resources
  `
});

// Example usage
async function demonstrateToolBudget() {
  console.log('🤖 Starting Tool Budget Pattern demonstration\n');
  
  const queries = [
    'What is machine learning?',
    'Latest AI developments in 2024',
    'Python programming basics',
    'Current stock market trends',
    'Recent breakthroughs in quantum computing'
  ];
  
  for (const [index, query] of queries.entries()) {
    console.log(`\n📋 Query ${index + 1}: "${query}"`);
    
    try {
      const response = await researchAgent.run(query);
      console.log(`💬 Response: ${response.substring(0, 200)}...`);
    } catch (error) {
      console.error(`❌ Error: ${error.message}`);
    }
    
    // Add delay between queries
    await new Promise(resolve => setTimeout(resolve, 500));
  }
}

// Run the demonstration
demonstrateToolBudget().catch(console.error);
```

## Pattern Implementation

### Step 1: Define the Budget Pattern

```typescript title="patterns/tool-budget.ts"
interface BudgetConstraints {
  maxTimes: number;
  resetPeriod?: 'hour' | 'day' | 'week' | 'month';
  warningThreshold?: number;
  exhaustedMessage?: string;
}

interface BudgetState {
  usageCount: number;
  lastReset: Date;
  isExhausted: boolean;
}

export function budget<T extends any>(
  tool: T,
  constraints: BudgetConstraints
): T & { getBudgetStatus: () => BudgetState } {
  const state: BudgetState = {
    usageCount: 0,
    lastReset: new Date(),
    isExhausted: false
  };

  const checkReset = () => {
    const now = new Date();
    const resetPeriod = constraints.resetPeriod || 'day';
    
    let shouldReset = false;
    switch (resetPeriod) {
      case 'hour':
        shouldReset = now.getTime() - state.lastReset.getTime() >= 3600000;
        break;
      case 'day':
        shouldReset = now.getTime() - state.lastReset.getTime() >= 86400000;
        break;
      case 'week':
        shouldReset = now.getTime() - state.lastReset.getTime() >= 604800000;
        break;
      case 'month':
        shouldReset = now.getTime() - state.lastReset.getTime() >= 2592000000;
        break;
    }
    
    if (shouldReset) {
      state.usageCount = 0;
      state.lastReset = now;
      state.isExhausted = false;
    }
  };

  const originalExecute = tool.execute;
  
  return {
    ...tool,
    description: `${tool.description}\n\n[BUDGET CONSTRAINT] This tool can be used ${constraints.maxTimes} times maximum. After that, it will return a failure. Use strategically as it represents expensive operations.`,
    
    execute: async (input: any) => {
      checkReset();
      
      if (state.usageCount >= constraints.maxTimes) {
        state.isExhausted = true;
        return {
          success: false,
          budget: constraints.exhaustedMessage || 
                  `This tool cannot be used anymore. Consider using local search instead.`
        };
      }
      
      const result = await originalExecute(input);
      state.usageCount++;
      
      const remaining = constraints.maxTimes - state.usageCount;
      const budgetMessage = remaining > 0 
        ? `This tool can be used ${remaining} more times`
        : `This tool can be used 0 more times`;
      
      return {
        ...result,
        budget: budgetMessage
      };
    },
    
    getBudgetStatus: () => ({ ...state })
  };
}
```

### Step 2: Apply Budget to Tools

```typescript title="tools/budgeted-tools.ts"
import { budget } from '../patterns/tool-budget';

// Original expensive tool
const originalWebScraper = {
  name: 'webScraper',
  description: 'Scrapes websites for current information',
  execute: async (input: { url: string; topic: string }) => {
    // Expensive operation implementation
    return await performWebScraping(input);
  }
};

// Apply budget constraints
export const budgetedWebScraper = budget(originalWebScraper, {
  maxTimes: 3,
  resetPeriod: 'day',
  warningThreshold: 0.8,
  exhaustedMessage: 'Web scraping quota exhausted. Try local search or wait for reset.'
});

// You can also create different budget levels
export const premiumWebScraper = budget(originalWebScraper, {
  maxTimes: 10,
  resetPeriod: 'hour'
});

export const conservativeWebScraper = budget(originalWebScraper, {
  maxTimes: 1,
  resetPeriod: 'day'
});
```

### Step 3: Monitor Budget Usage

```typescript title="monitoring/budget-monitor.ts"
class BudgetMonitor {
  private budgetedTools: any[] = [];
  
  addTool(tool: any) {
    if (tool.getBudgetStatus) {
      this.budgetedTools.push(tool);
    }
  }
  
  getUsageReport() {
    return this.budgetedTools.map(tool => ({
      name: tool.name,
      status: tool.getBudgetStatus(),
      description: tool.description
    }));
  }
  
  checkLowBudget(threshold: number = 0.2) {
    return this.budgetedTools.filter(tool => {
      const status = tool.getBudgetStatus();
      const remaining = 1 - (status.usageCount / this.getMaxUsage(tool));
      return remaining <= threshold && !status.isExhausted;
    });
  }
  
  private getMaxUsage(tool: any): number {
    // Extract max usage from tool description or metadata
    const match = tool.description.match(/can be used (\d+) times/);
    return match ? parseInt(match[1]) : 1;
  }
}

// Usage
const monitor = new BudgetMonitor();
monitor.addTool(budgetedWebScraper);

// Check usage periodically
setInterval(() => {
  const report = monitor.getUsageReport();
  console.log('Budget Report:', report);
  
  const lowBudgetTools = monitor.checkLowBudget();
  if (lowBudgetTools.length > 0) {
    console.warn('Low budget warning:', lowBudgetTools.map(t => t.name));
  }
}, 60000); // Check every minute
```

## Advanced Configuration

### Custom Budget Behaviors

```typescript title="patterns/advanced-budget.ts"
interface AdvancedBudgetOptions extends BudgetConstraints {
  onBudgetWarning?: (remaining: number) => void;
  onBudgetExhausted?: () => void;
  fallbackTool?: any;
  costPerUse?: number;
}

export function advancedBudget<T extends any>(
  tool: T,
  options: AdvancedBudgetOptions
): T {
  // ... budget implementation with callbacks
  
  return {
    ...tool,
    execute: async (input: any) => {
      // Check budget
      if (state.usageCount >= options.maxTimes) {
        if (options.onBudgetExhausted) {
          options.onBudgetExhausted();
        }
        
        if (options.fallbackTool) {
          console.log('🔄 Using fallback tool due to budget exhaustion');
          return await options.fallbackTool.execute(input);
        }
        
        return {
          success: false,
          budget: 'Budget exhausted',
          fallbackSuggestion: 'Try using local search instead'
        };
      }
      
      // Warning threshold
      const remaining = options.maxTimes - state.usageCount;
      const warningThreshold = options.warningThreshold || 0.2;
      
      if (remaining <= options.maxTimes * warningThreshold && options.onBudgetWarning) {
        options.onBudgetWarning(remaining);
      }
      
      // Execute and track
      const result = await originalExecute(input);
      state.usageCount++;
      
      return {
        ...result,
        budget: `${remaining - 1} uses remaining`,
        cost: options.costPerUse ? state.usageCount * options.costPerUse : undefined
      };
    }
  };
}
```

### Usage with Fallback

```typescript title="examples/fallback-example.ts"
const webScraperWithFallback = advancedBudget(webScrapingTool, {
  maxTimes: 3,
  resetPeriod: 'day',
  fallbackTool: localSearchTool,
  onBudgetWarning: (remaining) => {
    console.warn(`⚠️ Only ${remaining} web scraping uses remaining today`);
  },
  onBudgetExhausted: () => {
    console.log('🚫 Web scraping budget exhausted, using local search');
  }
});
```

## Testing the Pattern

```typescript title="__tests__/tool-budget.test.ts"
import { describe, it, expect, beforeEach } from 'vitest';
import { budget } from '../patterns/tool-budget';

describe('Tool Budget Pattern', () => {
  let mockTool: any;
  let budgetedTool: any;
  
  beforeEach(() => {
    mockTool = {
      name: 'testTool',
      description: 'Test tool',
      execute: async (input: any) => ({ success: true, data: input })
    };
    
    budgetedTool = budget(mockTool, { maxTimes: 2 });
  });
  
  it('should allow usage within budget', async () => {
    const result1 = await budgetedTool.execute({ test: 'data' });
    expect(result1.success).toBe(true);
    expect(result1.budget).toContain('1 more times');
    
    const result2 = await budgetedTool.execute({ test: 'data' });
    expect(result2.success).toBe(true);
    expect(result2.budget).toContain('0 more times');
  });
  
  it('should reject usage when budget exhausted', async () => {
    // Exhaust budget
    await budgetedTool.execute({ test: 'data' });
    await budgetedTool.execute({ test: 'data' });
    
    // Should now be rejected
    const result = await budgetedTool.execute({ test: 'data' });
    expect(result.success).toBe(false);
    expect(result.budget).toContain('cannot be used anymore');
  });
  
  it('should include budget constraint in description', () => {
    expect(budgetedTool.description).toContain('BUDGET CONSTRAINT');
    expect(budgetedTool.description).toContain('2 times maximum');
  });
});
```

## Integration with React

```typescript title="components/BudgetedAgent.tsx"
import React, { useState, useEffect } from 'react';
import { Agent } from 'openai-agent-sdk';
import { budgetedWebScraper } from '../tools/budgeted-tools';

interface BudgetStatus {
  usageCount: number;
  maxTimes: number;
  remaining: number;
  isExhausted: boolean;
}

export const BudgetedAgent: React.FC = () => {
  const [budgetStatus, setBudgetStatus] = useState<BudgetStatus | null>(null);
  const [response, setResponse] = useState<string>('');
  const [loading, setLoading] = useState(false);
  
  const agent = new Agent({
    apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY!,
    tools: [budgetedWebScraper]
  });
  
  const updateBudgetStatus = () => {
    const status = budgetedWebScraper.getBudgetStatus();
    setBudgetStatus({
      usageCount: status.usageCount,
      maxTimes: 3, // From tool configuration
      remaining: 3 - status.usageCount,
      isExhausted: status.isExhausted
    });
  };
  
  useEffect(() => {
    updateBudgetStatus();
  }, []);
  
  const handleQuery = async (query: string) => {
    setLoading(true);
    try {
      const result = await agent.run(query);
      setResponse(result);
      updateBudgetStatus();
    } catch (error) {
      setResponse(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="p-4">
      <div className="mb-4">
        <h3 className="text-lg font-semibold">Budget Status</h3>
        {budgetStatus && (
          <div className={`p-2 rounded ${
            budgetStatus.isExhausted ? 'bg-red-100' : 
            budgetStatus.remaining <= 1 ? 'bg-yellow-100' : 'bg-green-100'
          }`}>
            <p>Web Scraping: {budgetStatus.remaining} uses remaining</p>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ 
                  width: `${(budgetStatus.remaining / budgetStatus.maxTimes) * 100}%` 
                }}
              />
            </div>
          </div>
        )}
      </div>
      
      <div className="mb-4">
        <button
          onClick={() => handleQuery('What are the latest AI developments?')}
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {loading ? 'Thinking...' : 'Ask about AI developments'}
        </button>
      </div>
      
      {response && (
        <div className="p-4 bg-gray-100 rounded">
          <h4 className="font-semibold">Response:</h4>
          <p>{response}</p>
        </div>
      )}
    </div>
  );
};
```

## Best Practices

### 1. **Progressive Budget Exhaustion**
```typescript
const progressiveBudget = (tool: any, dailyLimit: number) => {
  const hourlyLimit = Math.ceil(dailyLimit / 24);
  
  return budget(tool, {
    maxTimes: hourlyLimit,
    resetPeriod: 'hour',
    exhaustedMessage: `Hourly limit reached. ${dailyLimit - getUsageToday()} uses remaining today.`
  });
};
```

### 2. **Smart Budget Allocation**
```typescript
const smartBudget = (tools: any[], totalBudget: number) => {
  const priority = tools.map(tool => tool.priority || 1);
  const allocation = priority.map(p => Math.floor(totalBudget * p / priority.reduce((a, b) => a + b)));
  
  return tools.map((tool, i) => budget(tool, { maxTimes: allocation[i] }));
};
```

### 3. **Budget Persistence**
```typescript
const persistentBudget = (tool: any, options: any) => {
  const storageKey = `budget_${tool.name}`;
  
  // Load state from localStorage
  const savedState = localStorage.getItem(storageKey);
  const state = savedState ? JSON.parse(savedState) : { usageCount: 0, lastReset: new Date() };
  
  const budgetedTool = budget(tool, options);
  
  // Save state after each use
  const originalExecute = budgetedTool.execute;
  budgetedTool.execute = async (input: any) => {
    const result = await originalExecute(input);
    localStorage.setItem(storageKey, JSON.stringify(budgetedTool.getBudgetStatus()));
    return result;
  };
  
  return budgetedTool;
};
```

## Next Steps

1. **Try the Examples**: Copy and run the code examples above
2. **Customize for Your Use Case**: Adapt the budget constraints to your needs
3. **Add Monitoring**: Implement budget tracking and alerts
4. **Explore Advanced Features**: Try fallback tools and custom behaviors
5. **Share Your Experience**: Join the community and share your results

## Related Patterns

- Fallback Chain Pattern (coming soon) - Provide alternatives when budget is exhausted
- Rate Limiting Pattern (coming soon) - Control request frequency
- Caching Pattern (coming soon) - Reduce redundant operations 