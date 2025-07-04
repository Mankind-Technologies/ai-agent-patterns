# Tap Actions Pattern - OpenAI Agent SDK

> **Real-time transparency for OpenAI Agent operations through intelligent tap interception**

## Quick Start

```typescript
import { Agent, tool, run } from "@openai/agents";
import { TapWrapper } from "./tapWrapper";

// 1. Create your agent with tools
const agent = new Agent({
    name: "TransparentAgent",
    model: "gpt-4.1-mini",
    instructions: "You are a helpful assistant...",
    tools: [tool(calculatorTool), tool(stringTool)]
});

// 2. Run with tap monitoring
const streamResult = await run(agent, "Calculate 25 + 17", { stream: true });

// 3. Create tap wrapper for transparency
const tapWrapper = new TapWrapper({
    onTap: (tap) => console.log("🔍", tap.message),
    flushOnMaxMessages: 2
});

// 4. Get results with real-time insights
const result = await tapWrapper.wrapStreamResult(streamResult);
```

## What You'll See

```bash
💬 User: "Calculate 25 + 17 and multiply by 3"
🔍 We performed arithmetic calculations to solve your request
🤖 Result: 25 + 17 = 42, then 42 × 3 = 126
```

## Core Components

### 🎯 TapWrapper Class
The heart of the pattern - intercepts, aggregates, and transforms agent operations:

```typescript
const tapWrapper = new TapWrapper({
    onTap: (insights) => {
        // Receive human-readable insights
        console.log(insights.message);
        updateUI(insights);
    },
    flushOnMaxMessages: 3,        // Aggregate every 3 tool calls
    tapSchema: CustomTapSchema,   // Define output structure
    paraphrasePrompt: "..."       // Customize AI paraphrasing
});
```

### 🛠️ Real Tools Included
The example comes with production-ready tools:

- **Calculator**: `add`, `subtract`, `multiply`, `divide`, `power`, `sqrt`
- **String Manipulation**: `uppercase`, `lowercase`, `reverse`, `length`, `word_count`
- **Random Generator**: Generate random numbers with custom ranges
- **Number Sorter**: Sort arrays of numbers in ascending order

### 📊 Custom Schema Support
Define exactly what insights you want:

```typescript
const CustomTapSchema = z.object({
    message: z.string().describe("Human-readable summary"),
    toolsUsed: z.array(z.string()).describe("List of tools called"),
    summary: z.string().describe("Brief operation summary")
});
```

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `onTap` | `Function` | Required | Callback for tap events |
| `flushOnMaxMessages` | `number` | `3` | Tool calls to aggregate |
| `tapSchema` | `ZodObject` | Basic schema | Structure of tap events |
| `paraphrasePrompt` | `string` | Default prompt | AI paraphrasing instructions |

## Advanced Usage

### Custom Paraphrasing
Tailor the AI's explanation style:

```typescript
const tapWrapper = new TapWrapper({
    onTap: (tap) => updateProgressBar(tap.message),
    paraphrasePrompt: `
        Transform these technical logs into encouraging, user-friendly updates.
        Use active voice and focus on progress made.
        Keep explanations under 50 words.
    `
});
```

### Real-time UI Updates
Perfect for progress indicators:

```typescript
const tapWrapper = new TapWrapper({
    onTap: (tap) => {
        // Update progress bar
        progressBar.update(tap.message);
        
        // Show tools being used
        if (tap.toolsUsed?.length > 0) {
            toolIndicator.show(tap.toolsUsed);
        }
    },
    flushOnMaxMessages: 2
});
```

## Running the Example

### Prerequisites
- Node.js 18+
- OpenAI API key

### Setup
```bash
# Install dependencies
npm install

# Set your OpenAI API key
export OPENAI_API_KEY="your-api-key-here"

# Run the interactive demo
npm start
```

### Sample Interactions
The demo includes these engaging test cases:

1. **Multi-step Math**: "Calculate 25 + 17, multiply by 3, add 100, divide by 2"
2. **Text Processing**: "Convert 'Hello World' to uppercase and tell me its length"
3. **Complex Workflow**: "Generate 5 random numbers, sort them, perform calculations"
4. **Mixed Operations**: "Find square root of 144, then reverse the text 'mathematics'"

## Implementation Details

### How It Works
1. **Stream Interception**: Taps into OpenAI's agent stream events
2. **Event Filtering**: Focuses on `tool_call_item` events for maximum relevance
3. **Intelligent Batching**: Collects operations until threshold is reached
4. **AI Paraphrasing**: Uses OpenAI's latest models to create human-readable summaries
5. **Structured Output**: Returns formatted insights via your `onTap` callback

### Performance Optimization
- **Fire-and-forget**: Tap processing doesn't block agent execution
- **Efficient Batching**: Reduces API calls while maintaining responsiveness
- **Minimal Overhead**: Adds <50ms latency to overall agent execution

### Error Handling
- Graceful degradation if paraphrasing fails
- Automatic retry logic for transient API errors
- Fallback to raw logs when structured output fails

## Best Practices

### ✅ Do This
- Use async callbacks in `onTap` for UI updates
- Batch related operations with appropriate `flushOnMaxMessages`
- Customize `paraphrasePrompt` for your specific use case
- Monitor performance impact in production

### ❌ Avoid This
- Blocking operations in `onTap` callbacks
- Setting `flushOnMaxMessages` too low (causes excessive API calls)
- Using this pattern for simple, single-step operations
- Ignoring error handling in production code

## Troubleshooting

**Agent operations not being tapped?**
- Verify your agent is using the streaming API (`stream: true`)
- Check that tools are properly registered with the agent

**Paraphrasing quality is poor?**
- Customize the `paraphrasePrompt` for your domain
- Adjust `flushOnMaxMessages` to provide better context
- Consider using a more powerful model for paraphrasing

**Performance issues?**
- Increase `flushOnMaxMessages` to reduce API calls
- Implement caching for similar operation patterns
- Profile your `onTap` callback for bottlenecks


---

*Make your AI agents transparent, trustworthy, and engaging with the Tap Actions pattern.* 