---
sidebar_position: 6
---

# Countdown Timer - OpenAI Agent SDK (TypeScript)

This example demonstrates how to implement the **Countdown Timer** pattern using the OpenAI Agent SDK in TypeScript.

## Overview

The Countdown Timer pattern provides LLMs with real-time awareness by wrapping tools to include time information. This enables better task prioritization and quality vs. speed trade-offs.

## Implementation

### CountDownTimer Class

```typescript
export class CountDownTimer {
    private startTime: number | null = null;
    private timeLimit: number;

    constructor(options: { time: number }) {
        this.timeLimit = options.time;
    }

    start(): void {
        this.startTime = Date.now();
    }

    getElapsedTime(): number {
        if (!this.startTime) return 0;
        return Math.floor((Date.now() - this.startTime) / 1000);
    }

    getRemainingTime(): number {
        const elapsed = this.getElapsedTime();
        return Math.max(0, this.timeLimit - elapsed);
    }

    isTimeUp(): boolean {
        return this.getElapsedTime() >= this.timeLimit;
    }

    getTimeInfo(): string {
        const elapsed = this.getElapsedTime();
        const remaining = this.getRemainingTime();
        const isOvertime = this.isTimeUp();
        
        if (isOvertime) {
            return `⏰ TIME EXCEEDED: ${elapsed}s elapsed (${elapsed - this.timeLimit}s overtime)`;
        }
        
        return `⏱️ Time: ${elapsed}s elapsed, ${remaining}s remaining`;
    }

    getAgentPromptDecoration(): string {
        return `
        You have ${this.timeLimit} seconds to complete your task.
        You will receive time information with each tool response.
        Use this information to prioritize your actions effectively.
        If you're running out of time, focus on the most important tasks first.
        `;
    }

    wrapTool<T extends Record<string, any>>(tool: any): any {
        return {
            ...tool,
            execute: async (input: T) => {
                const originalResult = await tool.execute(input);
                const timeInfo = this.getTimeInfo();
                
                // Append time information to the result
                if (typeof originalResult === 'string') {
                    return `${originalResult}\n\n${timeInfo}`;
                } else if (typeof originalResult === 'object' && originalResult !== null) {
                    return {
                        ...originalResult,
                        timeInfo
                    };
                }
                
                return originalResult;
            }
        };
    }
}
```

### Example Usage

```typescript
import { Agent, run } from 'openai-agents';
import { tool } from 'openai-agents/tools';
import { z } from 'zod';
import { CountDownTimer } from './countDownTimer';

// Create a timer with 60 seconds limit
const countDownTimer = new CountDownTimer({ time: 60 });

// Define your tools
const searchTool = tool({
    name: 'search',
    description: 'Search for information',
    parameters: z.object({
        query: z.string().describe('The search query'),
    }),
    execute: async ({ query }) => {
        // Simulate search operation
        await new Promise(resolve => setTimeout(resolve, 2000));
        return `Search results for: ${query}`;
    },
});

const analyzeTool = tool({
    name: 'analyze',
    description: 'Analyze data',
    parameters: z.object({
        data: z.string().describe('The data to analyze'),
    }),
    execute: async ({ data }) => {
        // Simulate analysis operation
        await new Promise(resolve => setTimeout(resolve, 3000));
        return `Analysis of: ${data}`;
    },
});

// Wrap tools with timer
const wrappedSearchTool = countDownTimer.wrapTool(searchTool);
const wrappedAnalyzeTool = countDownTimer.wrapTool(analyzeTool);

// Create the agent
const agent = new Agent({
    name: 'Time-Aware Research Agent',
    instructions: `
        You are a research assistant that helps users gather and analyze information.
        ${countDownTimer.getAgentPromptDecoration()}
        
        When time is running short, prioritize the most important information first.
        Consider using parallel tool calls when possible to save time.
    `,
    tools: [wrappedSearchTool, wrappedAnalyzeTool]
});

// Example function to run the agent
async function runTimedResearch(query: string) {
    console.log(`Starting research with 60-second time limit...`);
    
    // Start the timer
    countDownTimer.start();
    
    try {
        const result = await run(agent, `Research and analyze: ${query}`);
        
        const elapsed = countDownTimer.getElapsedTime();
        const wasOnTime = !countDownTimer.isTimeUp();
        
        console.log(`Research completed in ${elapsed}s ${wasOnTime ? '✅' : '⏰'}`);
        
        return result;
    } catch (error) {
        console.error('Research failed:', error);
        throw error;
    }
}

// Usage examples
async function examples() {
    // Example 1: Quick research task
    await runTimedResearch("Latest developments in AI agents");
    
    // Example 2: More complex research requiring prioritization
    await runTimedResearch("Market analysis of electric vehicles including competitor analysis, pricing trends, and technology developments");
}
```

### Advanced Usage with Different Time Limits

```typescript
// Customer support scenario (30 seconds)
const supportTimer = new CountDownTimer({ time: 30 });

const supportAgent = new Agent({
    name: 'Customer Support Agent',
    instructions: `
        You are a customer support agent.
        ${supportTimer.getAgentPromptDecoration()}
        
        Prioritize solving the customer's immediate problem quickly.
        If time is running short, provide a direct solution first,
        then explain details if time permits.
    `,
    tools: [
        supportTimer.wrapTool(lookupCustomerTool),
        supportTimer.wrapTool(searchKnowledgeBaseTool)
    ]
});

// Batch processing scenario (5 minutes)
const batchTimer = new CountDownTimer({ time: 300 });

const batchAgent = new Agent({
    name: 'Batch Processing Agent',
    instructions: `
        You are a batch processing agent.
        ${batchTimer.getAgentPromptDecoration()}
        
        Process as many items as possible within the time limit.
        If time is running short, prioritize the most important items.
        Use parallel processing when possible.
    `,
    tools: [
        batchTimer.wrapTool(processItemTool),
        batchTimer.wrapTool(validateResultTool)
    ]
});
```

## Key Features

1. **Automatic Time Tracking**: Time information is automatically added to all tool responses
2. **Real-time Updates**: Agent receives elapsed and remaining time with each tool call
3. **Overtime Detection**: Clear warnings when time limits are exceeded
4. **Flexible Integration**: Works with any OpenAI agents SDK tools
5. **Non-intrusive**: Time awareness doesn't interfere with primary functionality

## Best Practices

1. **Set Realistic Time Limits**: Choose time limits that allow for quality work while creating appropriate urgency
2. **Prioritize Instructions**: Clearly instruct the agent on what to prioritize when time is short
3. **Monitor Performance**: Track how often agents exceed time limits and adjust accordingly
4. **Use Parallel Processing**: Encourage agents to use parallel tool calls when time is limited
5. **Provide Fallback Strategies**: Give agents clear instructions on what to do when time runs out

## Real-world Applications

- **Customer Support**: 30-second response SLAs
- **Data Processing**: Time-boxed batch operations
- **Interactive Analysis**: Quick insights within user patience limits
- **API Rate Limiting**: Coordinating with external service time windows
- **User Experience**: Balancing thoroughness with responsiveness 