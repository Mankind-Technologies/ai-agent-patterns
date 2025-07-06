---
sidebar_position: 7
---

# Countdown Turns

> **Turn awareness transforms agent behavior from reactive to strategic**

AI agents operating with limited turns often fail catastrophically by exhausting their allowance without warning, or conversely, quit early when they could have achieved better results. This pattern provides visibility into turn consumption, enabling agents to plan strategically and balance quality with resource constraints.

## Problem

Most AI agent frameworks limit the number of turns (back-and-forth interactions with tools or other agents) to prevent infinite loops and resource waste. However, agents typically operate without awareness of these constraints, leading to:

- **Catastrophic Failures**: Agents run out of turns while pursuing complex solutions, leaving tasks incomplete
- **Premature Termination**: Agents stop early with "good enough" solutions when they have capacity for better results
- **Poor Resource Planning**: Without turn visibility, agents cannot prioritize high-impact actions
- **Unpredictable Behavior**: Users cannot anticipate when agents will fail or succeed based on task complexity

The fundamental issue is that turn limits are opaque to the agent, making it impossible to balance solution quality with resource management.

## Solution

The Countdown Turns pattern provides agents with:

1. **Turn Awareness**: Clear knowledge of maximum turns and current usage
2. **Strategic Planning**: Ability to prioritize actions based on remaining capacity
3. **Graceful Degradation**: Intelligent stopping before exhausting resources
4. **Quality Optimization**: Maximizing output quality within available turns

### Core Components

1. **Agent Configuration**: Explicit turn limit communication in instructions
2. **Turn Tracking**: Integration of current turn count in tool responses
3. **Strategic Prompting**: Guidance on balancing quality vs. resource usage

### Basic Implementation

```typescript
const agent = new Agent({
    name: 'CountdownAgent',
    tools: tools,
    instructions: `
        You have a maximum of 10 turns to complete your task. A turn is each 
        back-and-forth interaction with tools or other agents.
        
        IMPORTANT: Monitor your turn usage carefully:
        - Always check the current turn count in tool responses
        - Plan your actions strategically based on remaining turns
        - Aim to complete tasks before reaching turn 8-9 to avoid failure
        - Balance solution quality with turn availability
        
        If you're running low on turns, prioritize:
        1. Providing a working solution over a perfect one
        2. Communicating what you accomplished vs. what remains
        3. Suggesting next steps if the task isn't fully complete
    `,
});

// Tool wrapper that adds turn tracking
function withTurnTracking(tool: Tool, getCurrentTurn: () => number, maxTurns: number) {
    return {
        ...tool,
        execute: async (input: any) => {
            const result = await tool.execute(input);
            const currentTurn = getCurrentTurn();
            const remainingTurns = maxTurns - currentTurn;
            
            return {
                ...result,
                turnInfo: {
                    current: currentTurn,
                    remaining: remainingTurns,
                    warning: remainingTurns <= 2 ? "Running low on turns! Plan accordingly." : null
                }
            };
        }
    };
}
```

## Benefits

- **Predictable Behavior**: Agents can plan actions based on available resources
- **Resource Optimization**: Strategic use of turns leads to better outcomes
- **Graceful Degradation**: Controlled completion rather than abrupt failure
- **Improved Success Rate**: Agents complete more tasks successfully within limits
- **Better User Experience**: Clear communication about progress and constraints

## Pattern Interactions

### Complementary Patterns

- **[Surrender Task](./surrender-task)**: Perfect companion pattern - agents can gracefully surrender when approaching turn limits while communicating retry strategies
- **[Tool Budget](./tool-budget)**: Works together to manage multiple resource constraints (turns + tool usage)

### Combined Implementation Example

```typescript
const agent = new Agent({
    instructions: `
        You have 10 turns maximum to complete this task.
        
        Monitor your turn usage and if you're running low on turns:
        1. Check if the task is completable in remaining turns
        2. If not, use the surrender pattern to fail gracefully
        3. Provide clear feedback on what was accomplished
        4. Suggest retry strategies (more turns, different approach, etc.)
        
        Remember: It's better to surrender strategically than fail catastrophically.
    `,
    outputType: z.object({
        result: z.string(),
        success: z.boolean(),
        turnsSurrendered: z.boolean().optional(),
        failure: z.object({
            reason: z.string(),
            turnsUsed: z.number(),
            retryWithMoreTurns: z.boolean()
        }).optional()
    })
});
```

## When to Use

- **Resource-Constrained Environments**: When you have hard limits on agent interactions
- **Cost Management**: When each turn has associated costs that need to be controlled
- **Complex Multi-Step Tasks**: When tasks require multiple interactions but have failure risks
- **Quality vs. Speed Trade-offs**: When you need to balance solution quality with resource usage
- **Batch Processing**: When processing multiple items with turn budgets per item

## Example Use Cases

### 1. Code Analysis and Refactoring
**Scenario**: Analyzing large codebases with multiple files  
**Implementation**: Prioritize critical files first, leave nice-to-have analysis for later  
**Benefits**: Delivers essential insights even with turn constraints

### 2. Research and Data Gathering
**Scenario**: Comprehensive research requiring multiple sources  
**Implementation**: Start with primary sources, expand to secondary if turns allow  
**Benefits**: Provides solid foundation with potential for deeper analysis

### 3. Multi-step Problem Solving
**Scenario**: Complex problems requiring iterative refinement  
**Implementation**: Focus on working solution first, optimize if turns remain  
**Benefits**: Guarantees functional output with quality improvements when possible

## Trade-offs

**Pros:**
- Provides turn awareness to agents
- Enables strategic planning and resource management
- Prevents catastrophic failures
- Improves task completion rates
- Works well with other resource management patterns

**Cons:**
- Adds complexity to agent instructions
- Requires careful turn limit calibration
- May encourage rushed decisions in some cases
- Needs integration with existing tool systems

## Best Practices

1. **Clear Turn Communication**: Always inform agents about turn limits and tracking
2. **Strategic Thresholds**: Set warning levels (e.g., 2-3 turns remaining)
3. **Priority Guidance**: Help agents understand what actions are most important
4. **Quality Calibration**: Balance "good enough" vs. "perfect" based on available turns
5. **Integration with Surrender**: Combine with surrender task for optimal resource management
6. **User Communication**: Keep users informed about turn usage and constraints

## Example Implementation

A complete implementation of this pattern is available in the repository:

📁 **[View on GitHub](https://github.com/Mankind-Technologies/ai-agent-patterns/tree/main/src/patterns/countdownTurns/openai-agent-sdk-ts)**

This implementation demonstrates the core concepts of the Countdown Turns Pattern using the OpenAI Agent SDK for TypeScript. It includes:

- Complete source code with TypeScript types
- Turn tracking and monitoring utilities
- Integration with OpenAI Agent SDK
- Example scenarios and usage patterns
- Test cases demonstrating strategic behavior

## Key Takeaways

- Turn awareness transforms agent behavior from reactive to strategic
- The pattern is most effective when combined with surrender task capabilities
- Clear communication about limits and priorities is essential for success
- Better to complete tasks within limits than fail by exceeding them

> *"AI agents are like humans: if you don't tell them when is soon and when is late, they'll always return soon or late, but never on time."* 