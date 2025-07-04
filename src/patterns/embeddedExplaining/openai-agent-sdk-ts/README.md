# Embedded Explaining Pattern - OpenAI Agent SDK TypeScript

This example demonstrates the **Embedded Explaining Pattern** using the OpenAI Agent SDK for TypeScript. The pattern requires agents to provide clear explanations for their tool usage decisions, improving transparency and decision quality.

## Overview

The Embedded Explaining Pattern transforms opaque tool calls into transparent, explainable decisions by requiring agents to provide a "why" parameter for each tool use. This increases observability, improves debugging, and encourages more thoughtful agent behavior.

## Key Features

- **Explanation Requirements**: Tools require clear justification for each use
- **Transparency**: See exactly why agents chose specific tools
- **Debugging**: Easily understand agent decision-making process
- **Quality Improvement**: Forces agents to be more deliberate about tool selection
- **Customizable**: Configure explanation requirements per tool

## Installation

```bash
npm install
```

## Configuration

Set your OpenAI API key:

```bash
export OPENAI_API_KEY="your-api-key-here"
```

## Usage

### Basic Example

```typescript
import { withExplanation } from "./src/explaining";
import { baseWebScrapeTool } from "./src/tools";

// Add explanation requirement to tool
const explainedTool = withExplanation(baseWebScrapeTool, {
  requireExplanation: true,
  explanationPrompt: "Explain why web scraping is necessary and what specific information you're seeking"
});

// Tool now requires explanation
const result = await explainedTool.execute({
  url: "https://example.com",
  topic: "AI news",
  why: "User asked for latest AI developments and local knowledge may be outdated"
});
```

### Agent with Explained Tools

```typescript
import { Agent, tool, run } from "@openai/agents";
import { withExplanation } from "./src/explaining";
import { baseWebScrapeTool, baseLocalSearchTool } from "./src/tools";

// Create explained tools
const explainedWebTool = withExplanation(baseWebScrapeTool, {
  requireExplanation: true
});

const explainedLocalTool = withExplanation(baseLocalSearchTool, {
  requireExplanation: false
});

// Create agent
const agent = new Agent({
  name: "ExplainingResearchAssistant",
  model: "gpt-4o-mini",
  instructions: `You are a research assistant. For every tool call, you must:
    
    1. Explain WHY you're using that specific tool
    2. What information you expect to find
    3. Why this tool is better than alternatives for this task
    4. How this fits your overall research strategy
    
    Be specific and thoughtful in your explanations.`,
  tools: [tool(explainedWebTool), tool(explainedLocalTool)]
});

// Run queries
const response = await run(agent, "What are the latest JavaScript features?");
console.log(response.finalOutput);
```

## Running the Example

Run the complete demonstration:

```bash
npm start
```

This will show:
1. Basic explaining pattern usage
2. Custom explanation requirements
3. Error handling for missing explanations

## Pattern Benefits

### 1. **Transparency**
See exactly why agents chose specific tools:

```
[explaining] Tool webScrape called with explanation: "User asked for latest JavaScript features and local knowledge may be outdated"
```

### 2. **Better Debugging**
When agents make unexpected choices, the explanation reveals the reasoning:

```
Problem: Agent used expensive web scraping for basic question
Explanation: "User asked about 'current' JavaScript - interpreting as latest features"
Solution: Clarify prompt to distinguish 'current' vs 'latest'
```

### 3. **Quality Improvement**
Requiring explanations forces more deliberate decisions:

```
Without explanation: Random tool selection
With explanation: "Using local search first because this is foundational information"
```

### 4. **Cost Control**
Agents justify expensive operations:

```
Explanation: "User needs latest market data for time-sensitive decision - justifying web scraping cost"
```

## Configuration Options

### Custom Explanation Prompts

```typescript
const customTool = withExplanation(tool, {
  explanationPrompt: "Explain what specific information you need and why this tool is best"
});
```

### Optional Explanations

```typescript
const optionalTool = withExplanation(tool, {
  requireExplanation: false
});
```

## Advanced Usage

### Tool-Specific Requirements

```typescript
// Strict requirements for expensive tools
const expensiveTool = withExplanation(webScrapeTool, {
  requireExplanation: true,
  explanationPrompt: "Justify this expensive operation and what specific information you need"
});

// Relaxed requirements for free tools
const freeTool = withExplanation(localSearchTool, {
  requireExplanation: false,
  explanationPrompt: "Brief explanation of search strategy"
});
```

### Integration with Other Patterns

```typescript
// Combine with budget pattern
const budgetedExplainedTool = withExplanation(
  budget(expensiveTool, { maxTimes: 3 })
);

// Agent must explain why expensive tool is worth budget
await budgetedExplainedTool.execute({
  url: "https://premium-source.com",
  topic: "urgent research",
  why: "Critical deadline requires most current data - justifying premium source"
});
```

## Real-World Example Output

```
Query 1: "What are the latest JavaScript features?"
----------------------------------------
[explaining] Tool webScrape called with explanation: "User asked for 'latest' JavaScript features. Local knowledge may not include most recent updates, so web scraping developer.mozilla.org will provide current information."

Response: Based on the latest information from Mozilla Developer Network, JavaScript has several exciting new features...
```

## Testing

Run tests to verify explanation requirements:

```bash
npm test
```

## Common Use Cases

1. **Research Assistants**: Justify information source selection
2. **Customer Support**: Explain resolution approach choices
3. **Data Analysis**: Clarify analysis methodology
4. **Decision Support**: Document reasoning for compliance

## Troubleshooting

### Missing Explanations

```typescript
// This will fail
const result = await explainedTool.execute({
  query: "test"
  // Missing 'why' parameter
});
// Returns: { error: "EXPLANATION_REQUIRED", message: "..." }
```

### Too Generic Explanations

Use specific prompts to guide better explanations:

```typescript
const improvedTool = withExplanation(tool, {
  explanationPrompt: "Be specific about what information you need and why this tool is the best choice"
});
```

## Next Steps

1. **Implement Pattern**: Add explanations to your most critical tools
2. **Monitor Quality**: Track how explanations help with debugging
3. **Refine Prompts**: Iterate on explanation requirements based on usage
4. **Scale Up**: Apply to more tools as you see value

## Related Patterns

- **Tool Budget Pattern**: Combine explanations with cost justification
- **Fallback Pattern**: Explain why fallback tools are chosen
- **Audit Pattern**: Use explanations for compliance documentation

## Contributing

1. Fork the repository
2. Create your feature branch
3. Add tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

## License

MIT License - see LICENSE file for details 