---
sidebar_position: 4
---

# Tap Actions Pattern

<div className="badges">
<span className="badge badge--transparency">Transparency</span>
<span className="badge badge--debugging">Debugging</span>
<span className="badge badge--ux">User Experience</span>
<span className="badge badge--monitoring">Monitoring</span>
</div>

The Tap Actions Pattern transforms opaque AI agent operations into transparent, real-time insights by intercepting, aggregating, and presenting human-readable summaries of agent activities.

## Problem

AI agents often perform multiple complex operations behind the scenes, leaving users in the dark about what's actually happening. This creates:

- **Poor User Experience**: Users see agents "thinking" with no insight into actual work
- **Debugging Difficulties**: Hard to trace agent behavior and identify bottlenecks  
- **Reduced Trust**: Black box operations undermine confidence in AI systems
- **Limited Monitoring**: No visibility into agent performance and resource usage

## Solution

The Tap Actions Pattern provides an elegant solution by:

1. **Intercepting** agent operations (tool calls, reasoning steps, etc.)
2. **Aggregating** operations based on configurable thresholds
3. **Transforming** technical logs into human-readable insights using LLM paraphrasing

Think of it as a "glass box" approach to AI agent transparency.

## How It Works

```
User request => Agent
                  |-> LLM
           tap <--|-> tool
            |     |-> LLM
send<-agg<-tap <--|-> tool
                  |-> LLM
           tap <--|-> tool
            |     |-> LLM
send<-agg<-tap <--|-> tool
                  |-> LLM
                  ...
                  |
Agent response <---
```

The pattern operates through three key phases:

1. **Tap**: Intercept agent operations (tool calls, reasoning steps, etc.)
2. **Aggregate**: Collect and batch operations based on configurable thresholds
3. **Transform**: Convert technical logs into human-readable insights using LLM paraphrasing

## Implementation

### Core Concept

```typescript
interface TapConfig {
  onTap?: (events: TapEvent[]) => void;
  aggregationStrategy?: 'time' | 'count' | 'semantic' | 'hybrid';
  flushInterval?: number;
  batchSize?: number;
  paraphraseStyle?: 'summative' | 'progressive' | 'contextual';
}

function tapWrapper<T>(
  agent: T,
  config: TapConfig
): T & { getTapEvents: () => TapEvent[] } {
  // Implementation wraps agent calls with tap logic
}
```

### TypeScript Example

```typescript
import { tapWrapper } from './patterns/tap-actions';

// Original agent
const researchAgent = new Agent({
  tools: [webScrapingTool, calculatorTool, databaseTool],
  systemPrompt: "You are a research assistant..."
});

// Apply tap wrapper
const tappedAgent = tapWrapper(researchAgent, {
  onTap: (events) => {
    console.log(`🔍 Agent Activity: ${events.length} operations completed`);
    events.forEach(event => console.log(`  - ${event.summary}`));
  },
  aggregationStrategy: 'hybrid',
  flushInterval: 3000, // 3 seconds
  batchSize: 5,
  paraphraseStyle: 'contextual'
});

// Usage - same interface, enhanced visibility
const result = await tappedAgent.run("Analyze the latest market trends");
// Output:
// 🔍 Agent Activity: 3 operations completed
//   - Searching for recent market data from financial APIs
//   - Calculating trend analysis using statistical models  
//   - Retrieving historical data for comparison
```

## Event Types to Tap

### Tool Operations
- **Tool Calls**: "The agent is calculating..."
- **Tool Results**: "The agent found that..."
- **API Calls**: "The agent is fetching data..."

### Reasoning Steps
- **Planning**: "The agent is considering next steps..."
- **Decision Making**: "The agent chose approach X because..."
- **Error Handling**: "The agent encountered an issue and is retrying..."

### Resource Usage
- **Network Requests**: "The agent made 3 API calls"
- **Computation**: "The agent performed complex calculations"
- **Memory Operations**: "The agent accessed cached data"

## Aggregation Strategies

### Time-based Aggregation
```typescript
const config = {
  aggregationStrategy: 'time',
  flushInterval: 5000, // Flush every 5 seconds
  onTap: (events) => displayProgress(events)
};
```

### Count-based Aggregation
```typescript
const config = {
  aggregationStrategy: 'count',
  batchSize: 3, // Aggregate every 3 operations
  onTap: (events) => showBatchUpdate(events)
};
```

### Semantic Aggregation
```typescript
const config = {
  aggregationStrategy: 'semantic',
  groupRelated: true, // Group related operations
  onTap: (events) => showLogicalSteps(events)
};
```

## Real-World Example

### E-commerce Research Assistant

```typescript
// Agent that researches products across multiple platforms
const ecommerceAgent = new Agent({
  tools: [
    priceComparisonTool,
    reviewAnalysisTool,
    inventoryCheckTool,
    shippingCalculatorTool
  ]
});

// Add tap wrapper for transparency
const tappedEcommerceAgent = tapWrapper(ecommerceAgent, {
  onTap: (events) => {
    // Send real-time updates to UI
    updateProgressBar(events.length);
    displayCurrentActivity(events.map(e => e.summary));
  },
  aggregationStrategy: 'hybrid',
  flushInterval: 2000,
  paraphraseStyle: 'progressive'
});

// User sees real-time updates:
// "Checking prices across 5 retailers..."
// "Analyzing 247 customer reviews..."
// "Calculating shipping costs for your location..."
// "Comparing features and specifications..."
```

## Key Benefits

### 🔍 **Transparency**
Users gain real-time visibility into agent operations, building trust and understanding of the decision-making process.

### 🐛 **Debugging**
Developers can easily trace agent behavior, identify bottlenecks, and debug issues with detailed operation logs.

### 🎯 **User Experience**
Progress indicators, status updates, and contextual feedback keep users engaged during long-running operations.

### 🔧 **Customization**
Flexible configuration allows tailoring the experience for different use cases, audiences, and integration requirements.

## When to Use This Pattern

### Perfect for:
- **Long-running Operations**: Processes taking more than 5 seconds
- **Multi-step Workflows**: Complex tool chains with multiple operations
- **User-facing Applications**: Interactive systems requiring transparency
- **Production Monitoring**: Systems needing observability and debugging
- **Educational Applications**: Demonstrative AI systems for learning

### Consider Alternatives When:
- **Simple Operations**: Single-step processes with immediate results
- **Batch Processing**: Background operations where real-time feedback isn't needed
- **Resource Constraints**: Environments where additional LLM calls are costly
- **High-frequency Operations**: Systems with too many events to process meaningfully

## Performance Considerations

⚠️ **Critical**: Decouple tap processing from the main agent flow to prevent performance degradation.

### Best Practices

```typescript
// ✅ Good: Async processing
const config = {
  onTap: async (events) => {
    // Process in background
    setTimeout(() => processEvents(events), 0);
  }
};

// ❌ Bad: Blocking processing
const config = {
  onTap: (events) => {
    // This blocks the main agent flow
    expensiveProcessing(events);
  }
};
```

### Optimization Strategies
- **Async Processing**: Use non-blocking operations for tap event handling
- **Event Queuing**: Implement queues for high-throughput scenarios
- **Caching**: Cache paraphrased results for similar operation patterns
- **Monitoring**: Track additional latency introduced by the pattern

## Architecture Variants

### Real-time Streaming
Stream tap events directly to UI components for live updates during agent execution.

### Batch Processing
Collect tap events and process them in batches for better resource utilization.

### Hierarchical Tapping
Tap at multiple levels (individual tools, operation groups, entire workflows) for different granularities.

## Integration Examples

This pattern integrates seamlessly with popular AI agent frameworks:

- **OpenAI Agent SDK**: Complete TypeScript implementation available
- **LangChain**: Tap into chain execution events
- **Crew AI**: Monitor agent collaboration and task execution
- **Custom Frameworks**: Implement tap points in your agent orchestration layer

## Pattern vs. Direct Streaming

Most agent frameworks provide streaming capabilities. You might ask: why use this pattern instead of implementing streaming directly?

```typescript
// Direct streaming approach
const result = run(agent, "...", { stream: true });
let events = [];
for await (const event of result) {
    events.push(event);
    if (events.length > 3) {
        const flushEvents = events;
        events = [];
        doSomethingWithTheEvents(flushEvents);
    }
}
```

While this works, the Tap Actions Pattern offers two key advantages:

### 1. Clean Separation of Concerns
The pattern allows you to simply call the agent and wrap it for tapping without cluttering your main logic with event handling code.

### 2. Enhanced Reusability
The decoupled approach enables reusability across multiple agents and within agent chains. When one agent uses another as a tool, you can pass the same `tapWrapper` instance so nested agent calls contribute to the same user feedback stream.

## Example Implementation

A complete implementation of this pattern is available in the repository:

📁 **[View on GitHub](https://github.com/Mankind-Technologies/ai-agent-patterns/tree/main/src/patterns/tapActions/openai-agent-sdk-ts)**

This implementation demonstrates the core concepts of the Tap Actions Pattern using the OpenAI Agent SDK for TypeScript. It includes:

- Complete source code with TypeScript types
- Configuration options and examples
- Integration with OpenAI Agent SDK
- Test cases and usage scenarios

---

*The Tap Actions Pattern transforms AI agent operations from black boxes into transparent, understandable processes that users can follow and trust.* 