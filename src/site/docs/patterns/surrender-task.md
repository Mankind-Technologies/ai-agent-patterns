---
sidebar_position: 8
---

# Surrender Task Pattern

<div className="badges">
<span className="badge badge--tool">Resource Management</span>
<span className="badge badge--reliability">Reliability</span>
<span className="badge badge--agent">Production Ready</span>
</div>

The Surrender Task Pattern enables AI agents to fail gracefully when tasks become impossible or impractical, preventing resource waste and providing clear feedback to users and systems.

## Problem

AI agents often try persistently to fulfill their goals, sometimes beyond their actual capabilities. Without proper surrender mechanisms, agents may:

- **Consume excessive resources** attempting impossible tasks
- **Fail ungracefully** without clear feedback
- **Waste computational cycles** on futile attempts
- **Provide unclear guidance** on retry strategies

Common scenarios where tasks become impossible include:

- **External dependencies**: Tools relying on third-party systems that are offline or rate-limited
- **Resource exhaustion**: Search tools returning noisy data, causing agents to loop through keywords
- **Computational impracticality**: Requests requiring unreasonable resources (e.g., finding the 9048th twin prime)
- **Contextual constraints**: Temporary restrictions preventing task completion

## Solution

The Surrender Task Pattern provides agents with:

1. **Recognition of failure conditions** early to avoid resource waste
2. **Graceful failure** with structured output for better user experience
3. **Actionable feedback** including retry strategies and timing
4. **Programmatic handling** of failure states by management systems

The pattern requires three key components:

1. **Agent Configuration**: Explicit permission to fail in instructions
2. **Structured Output**: Schema supporting both success and failure states
3. **Failure Metadata**: Rich information about failure reasons and retry options


## Pattern Interactions

### Complementary Patterns

The Surrender Task Pattern works excellently with:

- **[Countdown Timer](./countdown-timer)**: Agents can surrender gracefully when approaching time limits
- **[Tool Budget](./tool-budget)**: Enables surrender when approaching maximum tool usage

## Benefits

### 1. **Resource Efficiency**
- Prevents wasted computational cycles on impossible tasks
- Reduces unnecessary API calls and external service usage
- Optimizes agent runtime and response times

### 2. **Better User Experience**
- Clear communication about failure reasons
- Actionable guidance on when and how to retry
- Reduces user frustration with unclear failures

### 3. **System Integration**
- Structured failure data enables automated retry logic
- Facilitates billing adjustments based on failure types
- Supports failure classification and monitoring

### 4. **Operational Reliability**
- Maintains service quality even when individual tasks fail
- Prevents cascading failures from resource exhaustion
- Enables graceful degradation under load

## Best Practices

### 1. **Clear Surrender Criteria**
Define specific conditions that warrant surrender:
- Number of failed attempts
- Time elapsed without progress
- Resource usage thresholds
- External service error patterns

### 2. **Detailed Failure Reasons**
Provide actionable information:
- Technical details for debugging
- User-friendly explanations
- Specific error codes or conditions
- Suggested alternative approaches

### 3. **Appropriate Retry Guidance**
Match retry recommendations to failure types:
- `fewSeconds`: Rate limiting, temporary network issues
- `fewHours`: Service maintenance, temporary outages
- `never`: Authentication failures, permanent restrictions
- `unknownTime`: Complex system issues, data quality problems

### 4. **Testing and Validation**
Regularly test surrender scenarios:
- Simulate external service failures
- Test with various resource constraints
- Validate retry timing recommendations
- Monitor surrender rates and patterns

## Considerations

### Balance Required
The pattern may encourage premature surrender if not carefully calibrated. Consider:
- Setting appropriate thresholds for surrender
- Providing clear guidelines on persistence vs. surrender
- Regular review and adjustment of surrender criteria

### User Communication
Ensure failure messages are helpful and non-technical:
- Avoid exposing internal error details
- Provide actionable next steps
- Suggest alternative approaches when possible

## Key Takeaways

- **Surrender is intelligent resource management**, not failure avoidance
- **Structured failure output** enables better system integration and user experience
- **Most effective when combined** with resource monitoring patterns like Tool Budget and Countdown Timer
- **Clear boundaries** between "try harder" and "surrender" scenarios are essential
- **Regular calibration** ensures the pattern remains effective as system constraints change

The Surrender Task Pattern transforms uncontrolled failures into strategic resource management, improving both system reliability and user experience. 


## TypeScript Example implementation

```typescript
import { z } from 'zod';
import { Agent } from 'openai-agent-sdk';

// Define the output schema with surrender capability
const TaskOutputSchema = z.object({
  responseToUser: z.string().describe('Human-readable response in non-technical language'),
  success: z.boolean().describe('Whether the task was completed successfully'),
  failure: z.object({
    reason: z.string().describe('Detailed explanation of why the task failed'),
    canTryLater: z.boolean().describe('Whether the user can retry this task later'),
    retryIn: z.enum(["fewSeconds", "fewHours", "never", "unknownTime"])
      .describe('Recommended timeframe for retry attempts'),
  }).nullable().describe('Present only when success is false'),
});

// Create agent with surrender capability
const agent = new Agent({
  name: 'TaskAgent',
  tools: [emailTool, searchTool],
  instructions: `
    You are a helpful assistant that can perform various tasks.
    
    Due to tool limitations or requests being out of scope, you are 
    allowed to fail. In such cases, return success: false and provide 
    detailed failure information.
    
    Surrender when:
    - External services are consistently unavailable
    - Search results are repeatedly irrelevant
    - Task requirements exceed reasonable resource limits
    - Contextual constraints make completion impossible
  `,
  outputType: TaskOutputSchema,
});

// Execute with surrender capability
const result = await agent.run('Send email to support@example.com');

if (result.success) {
  console.log('Task completed:', result.responseToUser);
} else {
  console.log('Task failed:', result.failure?.reason);
  console.log('Can retry:', result.failure?.canTryLater);
  console.log('Retry in:', result.failure?.retryIn);
}
```

## Real-World Examples

### Email Service Integration

```typescript
// Agent handling email with external service failures
const emailAgent = new Agent({
  name: 'EmailAgent',
  tools: [emailTool],
  instructions: `
    Send emails using the email tool.
    
    If the email service returns errors:
    - 401 Unauthorized: Surrender with "never" retry
    - 503 Service Unavailable: Surrender with "fewHours" retry
    - 429 Rate Limited: Surrender with "fewSeconds" retry
    - DNS/Network errors: Surrender with "fewHours" retry
  `,
  outputType: TaskOutputSchema,
});

// Handles different failure scenarios appropriately
const result = await emailAgent.run('Send quarterly report to team@company.com');
```

### Noisy Search Operations

```typescript
// Agent with search tool that can return irrelevant results
const searchAgent = new Agent({
  name: 'SearchAgent',
  tools: [searchTool, turnCounterTool],
  instructions: `
    Search for information using available tools.
    
    If search results are consistently irrelevant after 3 attempts,
    surrender with "unknownTime" retry and suggest alternative approaches.
    
    Use turn counter to track search attempts.
  `,
  outputType: TaskOutputSchema,
});

// Prevents infinite loops on poor search results
const result = await searchAgent.run('Find specific technical documentation');
```