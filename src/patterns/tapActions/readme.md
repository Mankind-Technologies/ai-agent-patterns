# AI Agent Pattern: Tap Actions

> **Transform opaque AI agent operations into transparent, real-time insights**

## The Problem

AI agents often perform multiple complex operations behind the scenes, leaving users in the dark about what's actually happening. This creates poor user experience, makes debugging difficult, and reduces trust in AI systems. Users see the agent "thinking" but have no insight into the actual work being performed.

## The Solution

The Tap Actions pattern provides a elegant solution by intercepting agent operations, intelligently aggregating them, and presenting human-readable summaries in real-time. Think of it as a "glass box" approach to AI agent transparency.

## How It Works

```ascii
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
                  ...
                  |
Agent response <---
```

The pattern operates through three key phases:

1. **Tap**: Intercept agent operations (tool calls, reasoning steps, etc.)
2. **Aggregate**: Collect and batch operations based on configurable thresholds
3. **Transform**: Convert technical logs into human-readable insights using LLM paraphrasing

## Key Benefits

### 🔍 **Transparency**
Users gain real-time visibility into agent operations, building trust and understanding.

### 🐛 **Debugging**
Developers can easily trace agent behavior and identify bottlenecks or errors. Howerver (lol, did this typing mistake, but I'm keeping it here to prove this has been partially wrote by a human being) more powerful observability tools exist, this pattern is not a replacement.

### 🎯 **User Experience**
Progress indicators, status updates, and contextual feedback keep users engaged during long operations.

### 🔧 **Customization**
Flexible configuration allows tailoring the experience for different use cases and audiences.

## When to Use This Pattern

**Perfect for:**
- Long-running agent operations (>5 seconds)
- Multi-step workflows with complex tool chains
- User-facing applications requiring transparency
- Production systems needing monitoring and debugging
- Educational or demonstrative AI applications

**Consider alternatives when:**
- Simple, single-step operations
- Batch processing where real-time feedback isn't needed
- Resource-constrained environments where additional LLM calls are costly. However, you can just format the agent events with code and fallback to a more traditional structured logging.

## Implementation Strategies

### Event Types to Tap
- **Tool Calls**: "The agent is calculating..." 
- **Tool Results**: "The agent found that..."
- **Reasoning Steps**: "The agent is considering..."
- **API Calls**: "The agent is fetching data..."

### Aggregation Strategies
- **Time-based**: Flush every 3-5 seconds
- **Count-based**: Aggregate every 3-5 operations
- **Semantic**: Group related operations together
- **Hybrid**: Combine multiple strategies for optimal UX

### Paraphrasing Approaches
- **Summative**: "Performed 3 calculations to solve the math problem"
- **Progressive**: "Step 1: Added numbers, Step 2: Applied formula"
- **Contextual**: "Based on your budget request, calculated monthly expenses"

## Performance Considerations

⚠️ **Critical**: Decouple tap processing from the main agent flow to prevent performance degradation.

### Best Practices:
- Use async/non-blocking operations for tap processing
- Implement tap event queuing for high-throughput scenarios
- Consider caching paraphrased results for similar operation patterns
- Monitor additional latency introduced by the pattern

## Architecture Variants

### Real-time Streaming
Stream tap events directly to UI components for live updates during agent execution.

### Batch Processing
Collect tap events and process them in batches for better resource utilization.

### Hierarchical Tapping
Tap at multiple levels (individual tools, operation groups, entire workflows) for different granularities.

## Integration Examples

This pattern integrates seamlessly with popular AI agent frameworks:

- **OpenAI Agent SDK**: See our complete TypeScript implementation
- **LangChain**: Tap into chain execution events
- **Crew AI**: Monitor agent collaboration and task execution
- **Custom Frameworks**: Implement tap points in your agent orchestration layer

## Critique

Most agent frameworks already provide streaming capabilities. In fact, our implementation leverages these existing streaming systems to make the pattern work. This raises a valid question: why use this pattern instead of implementing streaming directly?

```js
const agent = new Agent({...});

const result = run(agent, "...", {stream:true});
let events = []
for await (const event of result) {
    events.push(event);
    if (events.length > 3) {
        const flushEvents = events;
        events = [];
        doSomethingWithTheEvents(flushEvents);
    }
}
const output = result.finalOutput;
```

This approach makes sense and represents the pattern at work in its simplest form. However, there are two compelling reasons why decoupling the pattern into a separate component is beneficial:

1. **Clean Separation of Concerns**: The pattern allows you to simply call the agent and wrap the call for tapping without cluttering your main logic with event handling code. While this is somewhat subjective, it promotes cleaner, more maintainable code architecture.

2. **Enhanced Reusability**: The decoupled approach enables reusability across multiple agents and within agent chains. Consider scenarios where one agent uses another agent as a tool, or where a tool internally uses an agent. With this decoupling, you can pass down the same `tapWrapper` instance so that nested agent calls can contribute to the same user feedback stream, providing a unified experience across complex agent orchestrations.

---

*The Tap Actions pattern transforms AI agent operations from black boxes into transparent, understandable processes that users can follow and trust.*

