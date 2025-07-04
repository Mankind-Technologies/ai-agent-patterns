# On-Demand Context Retrieval with OpenAI Agent SDK (TypeScript)

This example demonstrates the On-Demand Context Retrieval pattern using the OpenAI Agent SDK for TypeScript. The scenario involves a car sales assistant that efficiently retrieves information from large car specification databases only when needed.

## Overview

The On-Demand Context Retrieval pattern solves the problem of having to load large amounts of context into your main agent's memory. Instead of loading everything upfront, it uses a specialized agent to retrieve only the relevant information when needed, dramatically reducing token usage across multi-turn conversations.

## Core Implementation

### 1. The Context Database

First, we have large documents that would be expensive to keep in memory:

```typescript
// Mock car databases - these would be large documents in a real scenario
const CAR_DATABASES = {
  bmw: `
BMW 3 Series 2024 Complete Specifications:
- Engine: 2.0L TwinPower Turbo 4-cylinder, 255 hp, 295 lb-ft torque
- Transmission: 8-speed automatic with paddle shifters
- Fuel Economy: 26 mpg city, 36 mpg highway
- Price: Starting at $35,300 MSRP
- Interior: Premium leather seats, 10.25" touchscreen, wireless Apple CarPlay
- Safety: 5-star safety rating, collision warning, lane departure warning
// ... thousands more tokens of detailed specifications
  `.trim(),
  // ... more brands with similar large documents
};
```

### 2. The Retrieval Agent

The specialized agent that handles the heavy lifting:

```typescript
// Car specifications retrieval agent - performs single turn with full context
const carSpecsAgent = new Agent({
  name: 'car_specs_agent',
  model: 'gpt-4o-mini',
  instructions: `You are a car specifications expert. Your task is to:
1. Retrieve the requested car specifications using the car_specs tool
2. Extract ONLY the relevant information that answers the user's specific question
3. Format the response clearly and concisely
4. Do not include unnecessary details - focus on what was asked

You will be given a specific query about car specifications. Use the tool to access the database and return only the relevant information.`,
  tools: [carSpecsTool]
});
```

### 3. The On-Demand Retrieval Tool

This is the key component that implements the pattern:

```typescript
const carSpecsRetrievalTool = tool({
  name: 'get_car_info',
  description: 'Get specific car information from detailed specifications database',
  parameters: z.object({
    brand: z.enum(['bmw', 'mercedes', 'toyota']).describe('The car brand to get information about'),
    question: z.string().describe('The specific question about the car brand or model')
  }),
  execute: async (input) => {
    const { brand, question } = input;
    console.log(`🔄 Retrieving ${brand.toUpperCase()} info for: "${question}"`);
    
    const query = `For ${brand}, ${question}`;
    const result = await run(carSpecsAgent, query);
    
    return result.finalOutput; // Returns only extracted relevant information
  }
});
```

### 4. The Main Agent

The main agent that benefits from light memory:

```typescript
const salesAgent = new Agent({
  name: 'sales_agent',
  model: 'gpt-4o-mini',
  instructions: `You are a knowledgeable car sales assistant. You help customers find the right car based on their needs.

When you need specific car information, use the get_car_info tool. This tool will:
- Access the full car database for that brand
- Extract only the relevant information
- Return concise, focused answers

You should:
- Ask clarifying questions to understand customer needs
- Use the get_car_info tool when you need specific car details
- Make comparisons and recommendations based on the information provided
- Be helpful and conversational
- Keep track of customer preferences throughout the conversation

Available brands: BMW, Mercedes, Toyota`,
  tools: [carSpecsRetrievalTool]
});
```

## Usage Examples

### Single Query Example

```typescript
const result = await run(salesAgent, "What's the fuel economy of the BMW 3 Series?");
console.log(result.finalOutput);
// Output: "The BMW 3 Series gets 26 mpg city and 36 mpg highway."
```

### Multi-Turn Conversation

The pattern really shines in multi-turn scenarios:

```typescript
// Turn 1: Customer asks about SUVs
const result1 = await run(salesAgent, "I need a family SUV with good safety ratings");

// Turn 2: Customer asks for comparison
const result2 = await run(salesAgent, "What about the BMW X5 vs Mercedes GLE?");

// Turn 3: Customer asks about specific features
const result3 = await run(salesAgent, "What are the interior features of the BMW X5?");
```

## Token Savings Analysis

This implementation demonstrates significant token savings:

### Without the Pattern (Naive Approach):
- **Turn 1**: 15,000 tokens (all databases) + 100 tokens (query) = 15,100 tokens
- **Turn 2**: 15,000 tokens (all databases) + 200 tokens (history) = 15,200 tokens
- **Turn 3**: 15,000 tokens (all databases) + 300 tokens (history) = 15,300 tokens
- **Total**: ~45,600 tokens

### With the Pattern:
- **Turn 1**: 5,000 tokens (one database) + 100 tokens (query) = 5,100 tokens → Returns 50 tokens
- **Turn 2**: 5,000 tokens (one database) + 150 tokens (history + query) = 5,150 tokens → Returns 50 tokens  
- **Turn 3**: 5,000 tokens (one database) + 200 tokens (history + query) = 5,200 tokens → Returns 50 tokens
- **Main agent turns**: 150 + 250 + 350 = 750 tokens
- **Total**: ~16,200 tokens

**Result**: ~64% reduction in token usage

## Key Benefits Demonstrated

1. **Memory Efficiency**: Main agent only holds relevant extracted information
2. **Cost Optimization**: Dramatic reduction in token usage across conversation turns
3. **Performance**: Faster processing with smaller context windows
4. **Modularity**: Clean separation between context retrieval and task execution

## Installation & Setup

```bash
npm install @openai/agents zod
```

Make sure to set your OpenAI API key:

```bash
export OPENAI_API_KEY="your-api-key-here"
```

## Running the Example

```bash
# Run the example scenarios
npx tsx index.ts

# Run in interactive mode
npx tsx index.ts --interactive

# Compare with naive approach
npx tsx index.ts --compare
```

## Pattern Analysis

This implementation demonstrates:

- **Specialized Retrieval**: The `carSpecsAgent` is optimized for extracting relevant information
- **Single-Turn Processing**: The retrieval agent does its work in one turn and exits
- **Context Preservation**: The main agent maintains conversation context without carrying full databases
- **Flexible Queries**: Can handle any type of question about the available data

The On-Demand Context Retrieval pattern is particularly effective when you have:
- Medium to large documents (thousands of tokens)
- Multi-turn conversations
- Specific information needs rather than general browsing
- Cost-sensitive applications

## When to Use This Pattern

✅ **Good for:**
- Technical documentation (manuals, API docs)
- Long email threads or conversations
- Product catalogs with detailed specifications
- Legal documents or contracts
- Multi-turn customer service scenarios

❌ **Not ideal for:**
- Small documents (< 1,000 tokens)
- Large knowledge bases needing semantic search (use RAG instead)
- One-time queries where overhead isn't justified

## Source Code

The complete source code for this example is available in the repository at:
`src/patterns/onDemandContextRetrieval/openai-agent-sdk-ts/index.ts` 