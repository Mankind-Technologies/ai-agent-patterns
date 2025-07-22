---
sidebar_position: 1
---

# Pattern Overview

This section contains documentation for various AI agent patterns that help solve common problems when building AI applications.

## Available Patterns

### Tool Budget
Controls tool usage with budget constraints to prevent expensive operations from exhausting resources.

[Learn more about Tool Budget →](/docs/patterns/tool-budget)

### Embedded Explaining
Adds explanation requirements to tools for better observability and quality by requiring agents to justify their tool usage decisions.

[Learn more about Embedded Explaining →](/docs/patterns/embedded-explaining)

### Tap Actions
Transforms opaque AI agent operations into transparent, real-time insights by intercepting, aggregating, and presenting human-readable summaries of agent activities.

[Learn more about Tap Actions →](/docs/patterns/tap-actions)

### Agent Switch
Provides flat complexity scalability for categorical use cases by hiding the selection of specialized agents behind a single tool with categorical parameters.

[Learn more about Agent Switch →](/docs/patterns/agent-switch)

### On-Demand Context Retrieval
Efficiently handles medium-sized documents by using a specialized agent to extract only relevant information, reducing token usage and improving performance in multi-turn conversations.

[Learn more about On-Demand Context Retrieval →](/docs/patterns/on-demand-context-retrieval)

### Countdown Timer
Provides real-time awareness to LLMs by wrapping tools to include time information, enabling better task prioritization and quality vs. speed trade-offs.

[Learn more about Countdown Timer →](/docs/patterns/countdown-timer)

### Countdown Turns
Provides visibility into turn consumption, enabling agents to plan strategically and balance quality with resource constraints by making turn limits visible to the agent.

[Learn more about Countdown Turns →](/docs/patterns/countdown-turns)

### Surrender Task
Enables AI agents to fail gracefully when tasks become impossible or impractical, preventing resource waste and providing clear feedback to users and systems.

[Learn more about Surrender Task →](/docs/patterns/surrender-task) 