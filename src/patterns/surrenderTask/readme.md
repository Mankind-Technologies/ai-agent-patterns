# AI Agent Pattern: Surrender Task

AI agents often try persistently to fulfill their goals (specially when instructed in the prompt), sometimes beyond their actual capabilities. While we develop AI agents to be capable of fulfilling their objectives, contextual limitations can make tasks temporarily or permanently impossible. This pattern provides a structured approach for agents to fail gracefully when success is not achievable.

## Problem Statement

Common scenarios where tasks become impossible include:

- **External dependencies**: Tools relying on third-party systems that are offline or rate-limited
- **Resource exhaustion**: Search tools returning noisy data, causing agents to loop through keywords until exhausting available turns
- **Computational impracticality**: Requests that are theoretically possible but require unreasonable resources (e.g., finding the 9048th [twin prime](https://en.wikipedia.org/wiki/Twin_prime))
- **Contextual constraints**: Temporary restrictions that prevent task completion

Without proper surrender mechanisms, agents may:
- Consume all available turns or context attempting impossible tasks
- Fail ungracefully without clear feedback
- Provide unclear guidance on retry strategies
- Waste computational resources on futile attempts

## Solution Overview

The Surrender Task pattern enables agents to:
1. **Recognize failure conditions** early to avoid resource waste
2. **Fail gracefully** with structured output for better user experience
3. **Provide actionable feedback** including retry strategies and timing
4. **Enable programmatic handling** of failure states by management systems

## Implementation

### Core Components

1. **Agent Configuration**: Explicit permission to fail in instructions
2. **Structured Output**: Schema that supports both success and failure states
3. **Failure Metadata**: Rich information about why the task failed and retry options

### Basic Implementation

```typescript
const agent = new Agent({
    name: 'TaskAgent',
    tools: tools,
    instructions: `
        You are a helpful assistant that can perform various tasks.
        Due to tool limitations or requests being out of scope, you are 
        allowed to fail. In such cases, return success:false and provide 
        detailed failure information.
    `,
    outputType: z.object({
        responseToUser: z.string().describe('Human-readable response in non-technical language'),
        success: z.boolean().describe('Whether the task was completed successfully'),
        failure: z.object({
            reason: z.string().describe('Detailed explanation of why the task failed'),
            canTryLater: z.boolean().describe('Whether the user can retry this task later'),
            retryIn: z.enum(["fewSeconds", "fewHours", "never", "unknownTime"])
                .describe('Recommended timeframe for retry attempts'),
        }).nullable().describe('Present only when success is false'),
    }),
});

const result = await run(agent, task);
```

### Benefits

- **Resource Efficiency**: Prevents wasted computational cycles on impossible tasks
- **Better UX**: Clear communication about failure reasons and retry strategies
- **System Integration**: Structured failure data enables automated retry logic, billing adjustments, and failure classification
- **Graceful Degradation**: Maintains service quality even when individual tasks fail

## Pattern Interactions

### Complementary Patterns

- **Countdown Timer**: Works excellently with surrender task - agents can fail gracefully when approaching time limits
- **Turn Budget**: Enables surrender when approaching maximum turn counts
- **Circuit Breaker**: Can trigger surrender when external services are consistently failing

### Considerations

- **Balance Required**: Pattern may encourage premature surrender if not carefully calibrated
- **Instruction Clarity**: Clear guidelines needed on when to surrender vs. when to persist
- **Threshold Definition**: Establish clear criteria for when surrender is appropriate

## Example Use Cases

### 1. Email Service Integration
**Scenario**: External email API failures
**Implementation**: Differentiate between temporary (503, 429) and permanent (401, DNS) failures
**Benefits**: Appropriate retry strategies based on error type

### 2. Noisy Search Operations
**Scenario**: Search tools returning irrelevant results
**Implementation**: Combine with turn counting to limit search attempts
**Benefits**: Prevents infinite loops while maximizing search effort

## Running the Examples

```bash
npm install
# Set your OpenAI API key
export OPENAI_API_KEY=your_api_key_here
npm run start
```

**Note**: You need a valid OpenAI API key to run the examples. The examples will show error messages if the API key is not configured.

The examples demonstrate:
- **Email Cases**: Different failure scenarios (unauthorized, server down, rate limiting, DNS issues)
- **Search Cases**: Noisy search results with turn counting
- **Comparison**: Side-by-side comparison of agents with and without surrender capability

## Best Practices

1. **Clear Surrender Criteria**: Define specific conditions that warrant surrender
2. **Detailed Failure Reasons**: Provide actionable information for users and systems
3. **Appropriate Retry Guidance**: Match retry recommendations to failure types
4. **Resource Monitoring**: Track resource usage to optimize surrender thresholds
5. **User Communication**: Ensure failure messages are helpful and non-technical

## Key Takeaways

- Surrender is not failure avoidance but intelligent resource management
- Structured failure output enables better system integration and user experience
- The pattern is most effective when combined with resource monitoring patterns
- Clear boundaries between "try harder" and "surrender" scenarios are essential for success
