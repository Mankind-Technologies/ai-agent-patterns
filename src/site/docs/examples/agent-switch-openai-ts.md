# Agent Switch with OpenAI Agent SDK (TypeScript)

This example demonstrates the Agent Switch pattern using the OpenAI Agent SDK for TypeScript. The scenario involves a multi-brand car dealership sales assistant that can switch between specialized agents for different car brands.

## Overview

The Agent Switch pattern allows you to hide the selection of specialized agents behind a single tool, using a categorical parameter to determine which agent to use. This maintains flat complexity while enabling specialized knowledge for each category.

## Core Implementation

### 1. Specialized Brand Agents

First, we create specialized agents for each car brand:

```typescript
import { Agent, tool, run } from '@openai/agents';
import { z } from 'zod';

// Specialized agent for BMW
const createBMWAgent = () => new Agent({
    name: 'BMW Sales Expert',
    instructions: `
You are a BMW sales expert specializing in luxury German automotive solutions.

BMW Brand Information:
- Premium German automotive brand known for "The Ultimate Driving Machine"
- Focus on performance, luxury, and innovative technology
- Key models: 3 Series, 5 Series, X3, X5, i4 (electric), iX (electric SUV)
- Financing: BMW Financial Services with competitive lease rates
- Typical customer: Performance-oriented, tech-savvy professionals

Provide detailed, brand-specific information for BMW vehicles, financing options, and customer benefits.
`,
    model: 'gpt-4o-mini'
});

// Similar specialized agents for Mercedes and Toyota...
```

### 2. The Agent Switch Tool

The core of the pattern is the switch tool that routes requests to the appropriate specialized agent:

```typescript
const answerQuestionForBrandTool = tool({
    name: 'answerQuestionForBrand',
    description: 'Get expert information about a specific car brand.',
    parameters: z.object({
        brand: z.enum(['BMW', 'Mercedes', 'Toyota']).describe('The car brand to get information about'),
        question: z.string().describe('The specific question about the car brand')
    }),
    execute: async (input) => {
        console.log(`🔄 Switching to ${input.brand} expert for: "${input.question}"`);
        
        let brandAgent;
        switch (input.brand) { // This is why it's called "agentSwitch"
            case 'BMW':
                brandAgent = createBMWAgent();
                break;
            case 'Mercedes':
                brandAgent = createMercedesAgent();
                break;
            case 'Toyota':
                brandAgent = createToyotaAgent();
                break;
            default:
                throw new Error(`Unknown brand: ${input.brand}`);
        }
        
        const result = await run(brandAgent, input.question);
        return result.finalOutput;
    }
});
```

### 3. Main Agent

The main agent orchestrates the switching behavior:

```typescript
const mainAgent = new Agent({
    name: 'Multi-Brand Car Sales Assistant',
    instructions: `
You are a helpful multi-brand car sales assistant for a dealership that sells BMW, Mercedes-Benz, and Toyota vehicles.

Your role is to:
1. Help customers with questions about any of these three brands
2. Use the answerQuestionForBrand tool to get expert information about specific brands
3. Compare different brands when asked
4. Provide general automotive advice

Available brands: BMW, Mercedes-Benz, Toyota

When a customer asks about a specific brand, use the answerQuestionForBrand tool to get expert information.
When comparing brands, use the tool multiple times to get information about each brand.
`,
    model: 'gpt-4o-mini',
    tools: [answerQuestionForBrandTool]
});
```

## Usage Examples

### Single Brand Question

```typescript
const result = await run(mainAgent, "What are the key features of the BMW 3 Series?");
console.log(result.finalOutput);
```

### Multi-Brand Comparison

The pattern excels at handling requests that involve multiple brands:

```typescript
const result = await run(mainAgent, "Compare the financing options between BMW and Toyota for a family SUV");
console.log(result.finalOutput);
```

### Complex Multi-Brand Requests

```typescript
const result = await run(mainAgent, "Give me the financing options for the BMW 3 Series, and the models of Toyota.");
console.log(result.finalOutput);
```

## Key Benefits Demonstrated

1. **Flat Complexity**: Adding new brands only requires updating the enum and adding a new case to the switch statement
2. **Specialization**: Each brand agent has deep, specific knowledge about its brand
3. **Multi-Brand Support**: Can handle requests involving multiple brands in a single conversation
4. **Clean Architecture**: Clear separation between routing logic and specialized knowledge

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
```

## Pattern Analysis

This implementation demonstrates:

- **Categorical Routing**: Uses an enum to ensure type safety and clear categories
- **Lazy Instantiation**: Agents are created only when needed
- **Unified Interface**: All brand agents share the same interface for consistency
- **Scalability**: Adding new brands requires minimal changes to the main agent

The Agent Switch pattern is particularly effective when you need specialized knowledge domains that share a common interface, making it ideal for multi-brand scenarios, regional variations, or any categorical specialization needs.

## Source Code

The complete source code for this example is available in the repository at:
`src/patterns/agentSwitch/openai-agent-sdk-ts/index.ts` 