# Embedded Explaining Pattern - OpenAI Agent SDK (TypeScript)

This implementation demonstrates the Embedded Explaining pattern using a real OpenAI Agent with the OpenAI Agent SDK for TypeScript.

## Overview

The Embedded Explaining pattern adds explanation requirements to tools, forcing agents to justify their reasoning for each tool call. This increases observability and improves decision quality by making agents more deliberate about their actions.

## Features

- **Real OpenAI Agent**: Complete agent implementation with explanation requirements
- **Tool Wrapper**: `withExplanation()` function that adds explanation requirements to any tool
- **Comparison Mode**: Compare agents with and without explanation requirements
- **Interactive Mode**: Chat with the agent to see explanations in real-time
- **Explanation Analytics**: Track and analyze explanation patterns
- **Configurable**: Adjust explanation requirements and behavior
- **Observable**: Complete audit trail of agent decision-making

## Installation

```bash
npm install
```

## Configuration

Create a `.env` file with your OpenAI API key:

```env
OPENAI_API_KEY=your_api_key_here
```

**Important**: You must set your OpenAI API key to run the actual agent. The demo will show the pattern structure and initialization without an API key, but needs the key to execute queries against the OpenAI API.

## Usage

### Running the Demo

The demo includes several modes to explore the embedded explaining pattern:

#### Comparison Mode (Default)
```bash
npm start
# or
npm start comparison
```
Runs the same queries with both explained and regular agents to show the difference.

#### Explanation-Only Mode
```bash
npm start explained
```
Runs only the agent with explanation requirements.

#### Regular Mode
```bash
npm start regular
```
Runs only the agent without explanation requirements.

#### Interactive Mode
```bash
npm start interactive
```
Interactive chat session where you can ask questions and see explanations in real-time.

### Agent Implementation

The demo includes a research assistant agent with two tools:
- **Web Scraping** (expensive): Requires explanations for each use
- **Local Search** (free): Optional explanations

```typescript
import { Agent, run } from "@openai/agents";
import { withExplanation } from "./src/explaining";

// Create tools with explanation requirements
const explainedWebScrapeTool = withExplanation(baseWebScrapeTool, {
    requireExplanation: true,
    explanationPrompt: "Explain why web scraping is necessary",
    includeReasoningInOutput: true
});

// Create agent
const agent = new Agent({
    name: "ExplainedResearchAssistant",
    model: "gpt-4o-mini",
    instructions: AGENT_INSTRUCTIONS,
    tools: [explainedWebScrapeTool, explainedLocalSearchTool],
});

// Run queries
const result = await run(agent, "What are the latest React features?");
```

## File Structure

```
src/
├── explaining.ts      # Core explanation wrapper functionality
├── config.ts         # Configuration management
├── knowledge-base.ts # Mock knowledge base for local search
└── index.ts         # Main agent implementation and demo
```

## Key Components

### `withExplanation(tool, options)`

The core function that wraps any tool to add explanation requirements:

```typescript
const explainedTool = withExplanation(originalTool, {
    requireExplanation: true,        // Make explanations mandatory
    explanationPrompt: "Explain why this action is justified",
    includeReasoningInOutput: true   // Include reasoning in tool output
});
```

### Agent Instructions

The agent is instructed to:
- Provide clear explanations for expensive tool usage
- Be strategic about tool selection
- Consider cost vs. value when using tools
- Explain decision-making process

### Configuration Options

- `requireExplanation`: Whether explanations are mandatory
- `explanationPrompt`: Custom prompt for explanation
- `includeReasoningInOutput`: Include reasoning analysis in output

## Example Output

```
🔍 Query 1: Tell me about JavaScript basics and frameworks
--------------------------------------------------
[explaining] Tool webScrape called with explanation: "Need current JavaScript framework information since local knowledge may be outdated"
[webScrape] Processing request for: JavaScript frameworks from https://developer.mozilla.org

📋 Response:
Based on my search, here's what I found about JavaScript basics and frameworks:

[Current information from web scraping about JavaScript frameworks...]

[EXPLANATION] Need current JavaScript framework information since local knowledge may be outdated
--------------------------------------------------

📊 EXPLANATION SUMMARY:
- Total explained tool calls: 3
- Tools with explanations: webScrape, localSearch
- Tool usage breakdown: webScrape: 2, localSearch: 1
- Latest explanation: "Need current React 18 features that aren't in local knowledge base"
```

## Benefits Demonstrated

### With Explanation Requirements:
✅ **Transparent decision-making process**
✅ **Justified tool usage with clear reasoning**
✅ **More strategic thinking about expensive operations**
✅ **Better audit trail of agent decisions**
✅ **Encourages cost-conscious behavior**

### Without Explanation Requirements:
⚠️ **Less transparent decision-making**
⚠️ **No insight into tool selection reasoning**
⚠️ **May use expensive tools without justification**
⚠️ **Harder to debug or optimize behavior**

## Pattern Benefits

1. **🔍 Transparency**: Clear reasoning for each tool use
2. **📊 Quality**: Forces deliberate decision-making
3. **🐛 Debugging**: Easy to understand agent behavior
4. **💰 Cost Control**: Encourages strategic tool usage
5. **🎛️ Flexibility**: Can be applied to any tool selectively

## Integration with Other Patterns

This pattern can be combined with others:
- **Tool Budget + Explanation**: "Why is this expensive tool worth using?"
- **Retry Logic + Explanation**: "Why retry with this strategy?"
- **Caching + Explanation**: "Why use cached vs fresh data?"

## Real-World Applications

- **Healthcare**: Explain diagnostic tool usage
- **Finance**: Justify trading decisions and data sources
- **Legal**: Document research reasoning and case law selection
- **Customer Service**: Explain resolution approaches and tool choices
- **Data Analysis**: Justify data source choices and analysis methods
- **Content Creation**: Explain research decisions and source selection

## Development

### Build
```bash
npm run build
```

### Development Mode
```bash
npm run dev
```

### Testing
```bash
npm test
```

## Advanced Usage

### Custom Explanation Requirements

```typescript
// Different explanation requirements for different tools
const criticalTool = withExplanation(baseTool, {
    requireExplanation: true,
    explanationPrompt: "Provide detailed justification for this critical operation",
    includeReasoningInOutput: true
});

const utilityTool = withExplanation(baseTool, {
    requireExplanation: false,  // Optional explanations
    explanationPrompt: "Briefly explain your reasoning",
    includeReasoningInOutput: false
});
```

### Explanation Analytics

```typescript
import { generateExplanationSummary, clearExplanationHistory } from "./src/explaining";

// Get explanation summary
console.log(generateExplanationSummary());

// Clear explanation history
clearExplanationHistory();
```

## License

MIT 