---
sidebar_position: 6
---

# Countdown Timer

> **Time is gold, give urgency feeling to your agents**

The pattern in a single line: provide LLMs with real-time awareness by wrapping tools to include time information, enabling better task prioritization and quality vs. speed trade-offs.

## Problem

LLMs cannot —for now— have a sense of the passing of time. Humans do. Sometimes we prefer something mediocre but fast, than something great but late. This can be achieved partially with a good prompt by instructing to minimize the amount of turns. However, this strategy has some pitfalls:

1. **Tool execution time varies**: Asking the LLM to be quick will instruct it to perform fewer tool calls, but this is independent of the actual time spent on tools. Sometimes a tool takes 30 seconds, sometimes 0.5 seconds. The urgency is usually about actual time, not just the number of turns.

2. **Suboptimal time usage**: Instructing the agent to be quick may leave available time on the table that could be used to provide better results within the time limit.

## Solution

Provide the model with a sense of real time passing and a time goal. Instead of adding a specific tool for time tracking (which would be wasteful and distracting), we wrap existing tools so they automatically return time information with each response.

```js
const countDownTimer = new CountDownTimer({time: 60});

// Wrap your tools
const wrappedTool = countDownTimer.wrapTool(originalTool);

const agent = new Agent({
    name: 'Time-Aware Agent',
    instructions: `
        You are a helpful assistant.
        ${countDownTimer.getAgentPromptDecoration()}
        
        Plan your approach based on the time information provided with each tool response.
        If you're running out of time, prioritize the most important tasks first.
    `,
    tools: [wrappedTool]
});

// Start the timer before running the agent
countDownTimer.start();
const result = await run(agent, "Your task here");
```

The agent receives time information automatically with each tool response, like having a clock on the wall that's always visible but not distracting.

## Benefits

1. **Real-time awareness**: The agent gets actual time information, not just turn-based urgency
2. **Automatic integration**: Time information is automatically added to all tool responses
3. **Better prioritization**: Agents can make informed decisions about which tasks to prioritize
4. **Increased parallel processing**: This pattern leads to higher rates of parallel tool calling
5. **Overtime detection**: Clear feedback when time limits are exceeded
6. **Non-intrusive**: Time awareness is embedded in existing tool responses, not a separate distraction

## When to Use

- **Time-sensitive tasks**: When you have genuine time constraints (SLAs, user patience, system timeouts)
- **Performance optimization**: When you want agents to balance quality vs. speed
- **Resource management**: When tools have different execution times and costs
- **User experience**: When users expect quick responses but still want quality results
- **Batch processing**: When processing multiple items with time budgets

## Example Scenarios

**Customer Support (30-second SLA)**
```js
const supportTimer = new CountDownTimer({time: 30});
// Agent will prioritize quick resolution over exhaustive research
```

**Data Processing (5-minute batches)**
```js
const batchTimer = new CountDownTimer({time: 300});
// Agent will process as many items as possible within the time limit
```

**Interactive Analysis (1-minute quick insights)**
```js
const analysisTimer = new CountDownTimer({time: 60});
// Agent will provide preliminary analysis quickly, then dive deeper if time allows
```

## Trade-offs

**Pros:**
- Provides real-time awareness to LLMs
- Enables better task prioritization
- Helps balance quality vs. speed
- Non-intrusive implementation
- Systematic time tracking

**Cons:**
- Adds slight overhead to tool execution
- May encourage rushed decisions in some cases
- Requires careful time limit calibration
- Could increase prompt length with time information

## Implementation Notes

- The timer starts when you call `start()` and tracks real elapsed time
- Time information is automatically appended to all tool responses
- The agent receives both elapsed time and remaining time
- Overtime warnings are logged and included in responses
- Works with any OpenAI agents SDK tools

> **Observation**: We noticed that LLMs (the ones we tested) are willing to be slightly late when the task quality requires it.

## Example Implementation

A complete implementation of this pattern is available in the repository:

📁 **[View on GitHub](https://github.com/Mankind-Technologies/ai-agent-patterns/tree/main/src/patterns/countDownTimer/openai-agent-sdk-ts)**

This implementation demonstrates the core concepts of the Countdown Timer Pattern using the OpenAI Agent SDK for TypeScript. It includes:

- Complete source code with TypeScript types
- Configuration options and examples
- Integration with OpenAI Agent SDK
- Test cases and usage scenarios 