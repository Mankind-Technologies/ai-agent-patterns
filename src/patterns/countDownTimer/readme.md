# AI Agents pattern: countDownTimer

> Time is gold, give urgency feeling to your agents

## Problem

LLMs can not -for now- have a sense of the passing of time. Humans do. Simetimes we preffer something mediocre but fast, than something great but late. This can be achieved partially with a good prompt, just instruct to minimise the amount of turns. Asking for a quicker resolution, will imply less tools and turns, and a faster response. However this is not the best strategy, and has some pitflls:

1. Asking the llm to be quick will instruct the llm to perform less tool calls, but this is independent of the actual time spent on tools. Sometimes a tool is 30 seconds, and someimtes its 0.5 seconds. Therefore, most of the times the urgency is not about the amount of turns or tool calls, its about just plain time.
2. We still want to get the best out of the time we have. Instructing the agent to be quick may give on the table available time that we could use to give a better result, in time.

## Solution

Provide to the model a sense of the real time passing, and a time goal. We could add a specific tool to the model for that, however this is going to be wasteful, and distract the agent from its main goal. We want this to be something that is there systematically, like a clock in the wall in front of you. For that, we can wrap the tools, so any tool now returns an extra field with the time-passing.

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

> Observation: We noticed that LLMs (the ones we tested) are willing to be slightly late.

## Benefits

1. **Real-time awareness**: The agent gets actual time information, not just turn-based urgency
2. **Automatic integration**: Time information is automatically added to all tool responses
3. **Prioritization guidance**: Agents can make better decisions about which tasks to prioritize, for example, this pattern leads to higher rate of parallel tool calling
4. **Overtime detection**: Clear feedback when time limits are exceeded
5. **Non-intrusive**: Time awareness is embedded in existing tool responses, not a separate distraction

## When to Use

- **Time-sensitive tasks**: When you have genuine time constraints (SLAs, user patience, system timeouts)
- **Performance optimization**: When you want agents to balance quality vs. speed
- **Resource management**: When tools have different execution times and costs
- **User experience**: When users expect quick responses but still want quality results
- **Batch processing**: When processing multiple items with time budgets

## Example Scenarios

**Scenario 1: Customer Support**
```js
const supportTimer = new CountDownTimer({time: 30}); // 30 seconds SLA
// Agent will prioritize quick resolution over exhaustive research
```

**Scenario 2: Data Processing**
```js
const batchTimer = new CountDownTimer({time: 300}); // 5 minutes per batch
// Agent will process as many items as possible within the time limit
```

**Scenario 3: Interactive Analysis**
```js
const analysisTimer = new CountDownTimer({time: 60}); // 1 minute for quick insights
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