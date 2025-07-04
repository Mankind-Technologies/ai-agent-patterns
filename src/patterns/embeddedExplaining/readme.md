# AI Agent Pattern: Embedded Explaining

AI agents often make tool calls without providing clear justification for their decisions. This can make it difficult to understand the agent's reasoning process and debug issues when the agent doesn't perform as expected.

This pattern adds a "why" parameter to tools that requires the agent to explain the goal and justification for each tool call. This increases observability and may improve the quality of tool usage by forcing the agent to be more deliberate about its decisions.

## Why This Pattern Matters

In real-world AI applications, understanding agent reasoning is crucial for:
- **Debugging**: When agents make unexpected tool calls, explanations help identify the cause
- **Trust**: Users can better trust agent decisions when they understand the reasoning
- **Quality**: Requiring explanations forces agents to be more thoughtful about tool usage
- **Compliance**: In regulated industries, decision explanations may be required
- **Learning**: Explanations help humans understand how agents approach problems

## The Research Assistant Example

Our example demonstrates a research assistant with explaining-enabled tools:

1. **Web Scraping with Explanation**
   - Requires justification for why web scraping is needed
   - Explains what information is being sought
   - Provides context about why local search isn't sufficient

2. **Local Search with Explanation**
   - Documents why local search is the chosen approach
   - Explains what specific information is being sought
   - Justifies why this is the best tool for the task

## Key Benefits Demonstrated

1. **Transparency**: Every tool call comes with clear reasoning
2. **Better Decision Making**: Agents are more thoughtful when required to explain
3. **Easier Debugging**: Failed strategies can be understood through explanations
4. **Audit Trail**: Complete record of decision-making process
5. **Quality Control**: Explanations can be reviewed for appropriateness

## Pattern Implementation

```js
interface ExplainedToolInput {
    // Original tool parameters
    url: string;
    topic: string;
    // Added explanation parameter
    why: string;
}

interface ExplainedToolOutput {
    // Original tool output
    content: string;
    success: boolean;
    source: string;
    // Added explanation tracking
    explanation: string;
    reasoning: string;
}

const scrapeUrlTool = {
    name: "scrapeUrlTool",
    description: "Used to gather latest data from a URL",
    parameters: z.object({
        url: z.string(),
        topic: z.string(),
    }),
    execute: (input) => {
        // ... scraping logic
        return { content: "...", success: true, source: input.url };
    }
}

const explainedScrapeUrlTool = withExplanation(scrapeUrlTool);
console.log(explainedScrapeUrlTool.description);
// Used to gather latest data from a URL
// 
// [EXPLANATION REQUIRED] You must provide a clear explanation of why this action is justified and what goal it serves.

const output = await explainedScrapeUrlTool.execute({
    url: "https://example.com", 
    topic: "javascript",
    why: "Need to get the latest JavaScript features since local knowledge may be outdated"
});
console.log(output);
// {
//   content: "...",
//   success: true,
//   source: "https://example.com",
//   explanation: "Need to get the latest JavaScript features since local knowledge may be outdated",
//   reasoning: "Agent justified web scraping due to need for current information"
// }
```

## Running the Example

The example in `openai-agent-sdk-ts/index.ts` shows how an agent provides explanations for its tool usage:

1. Agent explains why it chooses local search vs web scraping
2. Each tool call includes reasoning about the approach
3. Decision-making process becomes transparent
4. Users can see the logic behind each action
5. Debugging becomes easier when agents make unexpected choices

This demonstrates real-world value: improving agent transparency and decision quality.

## Real-World Applications

- **Healthcare**: Explain why specific diagnostic tools are being used
- **Finance**: Justify trading decisions and risk assessments
- **Legal**: Document reasoning for legal research and analysis
- **Customer Service**: Explain why specific resolution approaches are chosen
- **Data Analysis**: Justify why certain data sources or methods are selected

## Integration with Other Patterns

This pattern can be combined with other patterns:
- **Tool Budget + Explanation**: "Why is this expensive tool worth using?"
- **Retry Logic + Explanation**: "Why is this retry strategy appropriate?"
- **Caching + Explanation**: "Why use cached vs fresh data?"

The explanation pattern enhances observability across all tool usage scenarios. 