---
sidebar_position: 3
---

# Tap Actions Pattern - OpenAI Agent SDK (TypeScript)

<div className="badges">
<span className="badge badge--agent">TypeScript</span>
<span className="badge badge--transparency">Transparency</span>
<span className="badge badge--debugging">Debugging</span>
<span className="badge badge--ux">User Experience</span>
</div>

This example demonstrates the Tap Actions Pattern using the OpenAI Agent SDK for TypeScript, showing how to gain real-time visibility into agent operations.

## Complete Working Example

Here's a complete multi-tool agent that uses the Tap Actions Pattern to provide transparency into complex operations:

### Project Setup

```json title="package.json"
{
  "name": "tap-actions-example",
  "version": "1.0.0",
  "description": "Tap Actions Pattern Example",
  "main": "index.ts",
  "scripts": {
    "start": "tsx index.ts"
  },
  "dependencies": {
    "@openai/agents": "^0.0.10",
    "openai": "^5.8.2",
    "zod": "^3.25.71"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "tsx": "^4.0.0",
    "typescript": "^5.0.0"
  }
}
```

### Core Implementation

```typescript title="tapWrapper.ts"
import { AgentOutputType, StreamedRunResult, Agent, RunStreamEvent } from "@openai/agents";
import OpenAI from "openai";
import z from "zod";
import { zodTextFormat } from "openai/helpers/zod";

// Define a default ZodRawShape type for the tap message
type DefaultTapShape = {
    message: z.ZodString;
};

interface TapWrapperOptions<TContext, TAgent extends Agent<TContext, AgentOutputType>, TTap extends z.ZodRawShape> {
    onTap: (tap: z.infer<z.ZodObject<TTap>>) => void;
    flushOnMaxMessages?: number;
    paraphrasePrompt?: string;
    tapSchema?: z.ZodObject<TTap>;
}

const openai = new OpenAI();

const DEFAULT_PARAPHRASE_PROMPT = `
Rewrite the following logs. The output should be human readable, and should be a valid JSON object.
The logs come from an AI agent processing a user request. Therefore you have to rewrite the text,
using the same language as the logs, but in a plain language, no technical jargon.
Also use the first person (we), and the present tense (are, do, have).
`.trim();

export class TapWrapper<TContext, TAgent extends Agent<TContext, AgentOutputType>, TTap extends z.ZodRawShape = DefaultTapShape> {
    private onTap: (tap: z.infer<z.ZodObject<TTap>>) => void;
    private flushOnMaxMessages: number;
    private paraphrasePrompt: string;
    private tapSchema: z.ZodObject<TTap>;
    private log: string[] = [];

    constructor({ onTap, flushOnMaxMessages, paraphrasePrompt, tapSchema }: TapWrapperOptions<TContext, TAgent, TTap>) {
        this.onTap = onTap;
        this.flushOnMaxMessages = flushOnMaxMessages || 3;
        this.paraphrasePrompt = paraphrasePrompt || DEFAULT_PARAPHRASE_PROMPT;
        this.tapSchema = tapSchema || z.object({
            message: z.string(),
        }) as unknown as z.ZodObject<TTap>;
    }

    private async paraphraseEvents(logs: string[]): Promise<z.infer<z.ZodObject<TTap>>> {
        const content = logs.join("\n");
        const response = await openai.responses.parse({
            model: "gpt-4.1-nano-2025-04-14",
            input: [
                { role: "system", content: this.paraphrasePrompt },
                { role: "user", content }
            ],            
            text: {
                format: zodTextFormat(this.tapSchema, "tap"),
            },
        });
        return response.output_parsed as z.infer<z.ZodObject<TTap>>;
    }

    public async wrapStreamResult(streamResult: StreamedRunResult<TContext, TAgent>): Promise<StreamedRunResult<TContext, TAgent>> {
        const result = await streamResult;
        for await (const event of streamResult) {
            // Process events asynchronously to avoid blocking the main stream
            this.pushEvent(event);
        }
        // Flush any remaining events
        await this.storeAndMaybeFlush("Task finished", true);
        return result;
    }

    private async pushEvent(event: RunStreamEvent) {
        // Currently tracking tool calls - can be extended to include reasoning, handoffs, etc.
        if (event.type === "run_item_stream_event") {
            const runItem = event.item;
            if (runItem.type === "tool_call_item") {
                const toolCall = runItem.rawItem;
                if (toolCall.type === "function_call") {
                    const fnName = toolCall.name;
                    const fnArgs = toolCall.arguments;
                    const logLine = `Invoked function ${fnName} with params (${JSON.stringify(fnArgs)})`;
                    this.storeAndMaybeFlush(logLine);
                }
            }
        }
    }

    private async storeAndMaybeFlush(logLine: string, forceFlush: boolean = false) {
        this.log.push(logLine);
        if (this.log.length >= this.flushOnMaxMessages || forceFlush) {
            const flushLogs = this.log;
            this.log = [];
            const tap = await this.paraphraseEvents(flushLogs);
            this.onTap(tap);
        }
    }
}
```

### Multi-Tool Agent Example

```typescript title="index.ts"
import { Agent, tool, run } from "@openai/agents";
import { TapWrapper } from "./tapWrapper";
import z from "zod";

// Define tool schemas
const calculatorInputSchema = z.object({
    operation: z.enum(["add", "subtract", "multiply", "divide", "power", "sqrt"]),
    a: z.number(),
    b: z.number().nullable()
});

const stringManipulationInputSchema = z.object({
    operation: z.enum(["uppercase", "lowercase", "reverse", "length", "word_count"]),
    text: z.string()
});

const randomNumberInputSchema = z.object({
    min: z.number().default(0),
    max: z.number().default(100),
    count: z.number().default(1)
});

const sortNumbersInputSchema = z.object({
    numbers: z.array(z.number())
});

// Tool implementations
function executeCalculator(operation: string, a: number, b?: number): number {
    switch (operation) {
        case "add":
            return a + (b || 0);
        case "subtract":
            return a - (b || 0);
        case "multiply":
            return a * (b || 1);
        case "divide":
            if (b === 0) throw new Error("Division by zero");
            return a / (b || 1);
        case "power":
            return Math.pow(a, b || 2);
        case "sqrt":
            if (a < 0) throw new Error("Cannot take square root of negative number");
            return Math.sqrt(a);
        default:
            throw new Error(`Unknown operation: ${operation}`);
    }
}

function executeStringManipulation(operation: string, text: string): string | number {
    switch (operation) {
        case "uppercase":
            return text.toUpperCase();
        case "lowercase":
            return text.toLowerCase();
        case "reverse":
            return text.split('').reverse().join('');
        case "length":
            return text.length;
        case "word_count":
            return text.trim().split(/\s+/).length;
        default:
            throw new Error(`Unknown operation: ${operation}`);
    }
}

function executeRandomNumber(min: number = 0, max: number = 100, count: number = 1): number[] {
    const numbers: number[] = [];
    for (let i = 0; i < count; i++) {
        numbers.push(Math.floor(Math.random() * (max - min + 1)) + min);
    }
    return numbers;
}

function executeSortNumbers(numbers: number[]): number[] {
    return numbers.sort((a, b) => a - b);
}

// Define tools
const calculatorTool = {
    name: "calculator",
    description: "Perform basic arithmetic operations",
    parameters: calculatorInputSchema,
    execute: async (input: z.infer<typeof calculatorInputSchema>) => {
        const result = executeCalculator(input.operation, input.a, input.b ?? undefined);
        return { result, operation: input.operation };
    }
};

const stringManipulationTool = {
    name: "string_manipulation",
    description: "Manipulate strings in various ways",
    parameters: stringManipulationInputSchema,
    execute: async (input: z.infer<typeof stringManipulationInputSchema>) => {
        const result = executeStringManipulation(input.operation, input.text);
        return { result, operation: input.operation, originalText: input.text };
    }
};

const randomNumberTool = {
    name: "random_number",
    description: "Generate random numbers",
    parameters: randomNumberInputSchema,
    execute: async (input: z.infer<typeof randomNumberInputSchema>) => {
        const result = executeRandomNumber(input.min, input.max, input.count);
        return { numbers: result, min: input.min, max: input.max, count: input.count };
    }
};

const sortNumbersTool = {
    name: "sort_numbers",
    description: "Sort numbers in ascending order",
    parameters: sortNumbersInputSchema,
    execute: async (input: z.infer<typeof sortNumbersInputSchema>) => {
        const result = executeSortNumbers(input.numbers);
        return { numbers: result };
    }
};

// Define custom tap schema for structured output
const CustomTapSchema = z.object({
    message: z.string(),
    toolsUsed: z.array(z.string()).nullable(),
    summary: z.string().nullable()
});

async function main() {
    console.log("🚀 Starting Tap Actions Pattern Example");
    console.log("=====================================");

    // Create the agent with multiple tools
    const agent = new Agent({
        name: "TapActionDemoAgent",
        model: "gpt-4.1-mini",
        instructions: `You are a helpful assistant with access to calculator, string manipulation, and random number generation tools. 
        When users ask for calculations, use the calculator tool. 
        When they ask about text manipulation, use the string_manipulation tool.
        When they need random numbers, use the random_number tool.
        Be friendly and explain what you're doing step by step.`,
        tools: [
            tool(calculatorTool),
            tool(stringManipulationTool),
            tool(randomNumberTool),
            tool(sortNumbersTool)
        ]
    });

    // Test queries that demonstrate multi-step operations
    const testQueries = [
        "Calculate 25 + 17 and then multiply the result by 3, then add 100 and then divide by 2",
        "Convert 'Hello World' to uppercase and tell me its length, take the length and multiply by 2",
        "Generate 5 random numbers between 1 and 50, sort them from lowest to highest, then perform x1-x2+x3-x4+x5 where x1 is the lowest number, x2 is the second lowest, etc.",
        "What's the square root of 144, and then reverse the text 'mathematics'?"
    ];

    for (const query of testQueries) {
        console.log(`\n💬 User Query: "${query}"`);
        console.log("─".repeat(50));
        
        try {
            // Create and configure the tap wrapper
            const tapWrapper = new TapWrapper({
                onTap: (tap) => {
                    console.log("📡 TAP EVENT:", tap.message);
                    if (tap.toolsUsed && tap.toolsUsed.length > 0) {
                        console.log("🔧 Tools Used:", tap.toolsUsed.join(", "));
                    }
                    if (tap.summary) {
                        console.log("📋 Summary:", tap.summary);
                    }
                },
                flushOnMaxMessages: 2, // Flush every 2 tool calls
                tapSchema: CustomTapSchema
            });

            // Run the agent with streaming
            const streamResult = await run(agent, query, { stream: true });
            
            // Wrap the stream result with tap functionality
            const wrappedResult = await tapWrapper.wrapStreamResult(streamResult as any);
            
            // Display the final result
            console.log("🤖 Agent Response:", wrappedResult.finalOutput);
            
        } catch (error) {
            console.error("❌ Error:", error.message);
        }
        
        console.log("=".repeat(70));
    }
}

// Run the example
main().catch(console.error);
```

## Key Features Demonstrated

### 1. **Real-time Transparency**
The tap wrapper intercepts tool calls and provides human-readable summaries:

```typescript
// Raw log: "Invoked function calculator with params {\"operation\":\"add\",\"a\":25,\"b\":17}"
// Becomes: "We are adding 25 and 17 to get the sum"
```

### 2. **Configurable Aggregation**
Control when tap events are flushed:

```typescript
const tapWrapper = new TapWrapper({
    flushOnMaxMessages: 2, // Flush every 2 operations
    onTap: (tap) => console.log("📡", tap.message)
});
```

### 3. **Custom Tap Schema**
Define structured output for tap events:

```typescript
const CustomTapSchema = z.object({
    message: z.string(),
    toolsUsed: z.array(z.string()).nullable(),
    summary: z.string().nullable()
});
```

### 4. **Asynchronous Processing**
Tap processing doesn't block the main agent flow:

```typescript
// Events are processed asynchronously
for await (const event of streamResult) {
    this.pushEvent(event); // Non-blocking
}
```

## Sample Output

When you run this example, you'll see output like:

```
🚀 Starting Tap Actions Pattern Example
=====================================

💬 User Query: "Calculate 25 + 17 and then multiply the result by 3"
──────────────────────────────────────────────────
📡 TAP EVENT: We are adding 25 and 17 to get the sum, then multiplying the result by 3 to get the final answer.
🔧 Tools Used: calculator
📋 Summary: Performed arithmetic calculations as requested
📡 TAP EVENT: We have finished the calculation and are ready to provide the result.
🤖 Agent Response: I'll help you calculate that step by step.

First, let me add 25 + 17:
25 + 17 = 42

Now I'll multiply that result by 3:
42 × 3 = 126

So the final answer is 126.
```

## Configuration Options

### Tap Schema Customization

```typescript
// Simple schema
const SimpleTapSchema = z.object({
    message: z.string()
});

// Detailed schema
const DetailedTapSchema = z.object({
    message: z.string(),
    toolsUsed: z.array(z.string()),
    summary: z.string(),
    timestamp: z.string(),
    operationCount: z.number()
});
```

### Paraphrase Prompt Customization

```typescript
const customPrompt = `
Transform these technical logs into user-friendly progress updates.
Focus on what the agent is accomplishing for the user.
Use encouraging language and be specific about progress.
`;

const tapWrapper = new TapWrapper({
    paraphrasePrompt: customPrompt,
    onTap: (tap) => console.log("🎯", tap.message)
});
```

### Flush Strategies

```typescript
// Flush every 3 operations
const operationBased = new TapWrapper({
    flushOnMaxMessages: 3,
    onTap: handleTap
});

// Custom flush logic can be implemented by extending the class
class CustomTapWrapper extends TapWrapper {
    private async customFlushLogic() {
        // Implement time-based or semantic flushing
    }
}
```

## Running the Example

1. Install dependencies:
```bash
npm install
```

2. Set up your OpenAI API key:
```bash
export OPENAI_API_KEY="your-api-key-here"
```

3. Run the example:
```bash
npm start
```

## Integration with UI Components

The tap events can be easily integrated with UI components:

```typescript
// React component integration
const [tapEvents, setTapEvents] = useState<string[]>([]);

const tapWrapper = new TapWrapper({
    onTap: (tap) => {
        setTapEvents(prev => [...prev, tap.message]);
    },
    flushOnMaxMessages: 2
});

// Display in UI
{tapEvents.map((event, index) => (
    <div key={index} className="tap-event">
        {event}
    </div>
))}
```

## Performance Considerations

- **Asynchronous Processing**: Tap events are processed without blocking the main agent flow
- **Configurable Batching**: Adjust `flushOnMaxMessages` based on your performance requirements
- **Custom Paraphrasing**: Use faster models for paraphrasing if latency is critical
- **Event Filtering**: Extend the `pushEvent` method to filter specific event types

This implementation provides a robust foundation for adding transparency to any OpenAI Agent SDK application, making AI agent operations visible and understandable to users. 