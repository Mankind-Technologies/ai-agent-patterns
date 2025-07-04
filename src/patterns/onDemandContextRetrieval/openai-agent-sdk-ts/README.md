# On-Demand Context Retrieval Pattern - Car Sales Assistant

This example demonstrates the **On-Demand Context Retrieval** pattern using a multi-brand car sales assistant.

## The Pattern

The On-Demand Context Retrieval pattern is designed for scenarios where:
- You have medium-sized documents (thousands to tens of thousands of tokens)
- Your agent needs to extract specific information from these documents
- You want to avoid loading all context into every conversation turn
- You need to optimize token usage and costs

## How It Works

1. **carSpecsAgent**: Loads the full car database for a specific brand in a single turn
2. **carSpecsRetrievalTool**: Bridges the main agent with the specs agent
3. **salesAgent**: Works with extracted information across multiple turns

## Key Benefits

- **84% token reduction** compared to naive approaches
- **Cost optimization** for multi-turn conversations
- **Performance improvement** with smaller context windows
- **Clean separation** between context retrieval and task execution

## Prerequisites

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set your OpenAI API key:
   ```bash
   export OPENAI_API_KEY=your_api_key_here
   ```

## Usage

### Basic Demo
```bash
npm start
```

### Interactive Mode
```bash
npm run interactive
```

### Comparison Mode
```bash
npm run compare
```

## Example Queries

Try these queries to see the pattern in action:

- "What's the fuel economy of the BMW 3 Series?"
- "I need a family SUV with good safety ratings"
- "Compare the BMW X5 vs Mercedes GLE"
- "What's the price range for Toyota hybrid cars?"

## Pattern Implementation

The core of the pattern is the `carSpecsRetrievalTool`:

```typescript
const carSpecsRetrievalTool = tool({
  name: 'get_car_info',
  description: 'Get specific car information from detailed specifications database',
  parameters: z.object({
    brand: z.enum(['bmw', 'mercedes', 'toyota']),
    question: z.string()
  }),
  execute: async (params) => {
    const { brand, question } = params;
    const query = `For ${brand}, ${question}`;
    const result = await run(carSpecsAgent, query);
    return result.finalOutput;
  }
});
```

This tool:
1. Takes a specific question about a car brand
2. Runs the carSpecsAgent with the full database
3. Returns only the relevant extracted information
4. Allows the main agent to continue with lightweight context

## Token Savings Example

For a 10-turn conversation:
- **Without pattern**: ~105,500 tokens (carries full context every turn)
- **With pattern**: ~16,600 tokens (only extracted info)
- **Savings**: 84% reduction in token usage!

## Available Car Data

The example includes specifications for:
- **BMW**: 3 Series, X5, i4 (electric)
- **Mercedes**: C-Class, GLE, EQS (electric)
- **Toyota**: Camry, RAV4, Prius (hybrid)

Each database contains detailed specifications including engine, transmission, fuel economy, pricing, interior features, safety ratings, dimensions, and warranty information. 