---
sidebar_position: 5
---

# Agent Switch

> **Flat complexity scalability for categorical use cases**

The pattern in a single line: hide the selection of one agent from a pool of specialized agents behind a single tool, using a categorical parameter to determine which agent to use. This allows isolated specialization while maintaining flat complexity.

## Problem

Let's say you have to build an agent to help the sales team of a multi-brand car shop. The salesman can ask the agent for financing quotes, car variants, brand promotions, rental services, and more. One of the structural challenges is that all those use cases depend tightly on the car brand. For example, financing options depend on the car brand because the financing company is the brand-associated financing branch. Car variants obviously depend on the car brand... and you get the point.

You may end up with this approach:

```js
const getFinancingOptionsTool = tool({
    name: "get_financing_options",
    parameters: z.object({
        carBrand: string,
        carModel: string,
        ...
    }),
    ...
});
const getCarVariantsTool = tool({
    name: "get_car_variants",
    parameters: z.object({
        carBrand: string,
        carModel: string,
        ...
    }),
    ...
});
const agent = new Agent({
    name: 'multi-brand',
    instructions: `
You are a helpful multibrand sales support agent... 
Here is the information for the brands:
Car brand 1: a budget european car brand, ....
Car brand 2: ...
...
Car brand N: ...
`,
    tools: [...]
})
```

This will not scale. With more brands, you get bigger prompts and it becomes more complicated for the underlying LLM to understand the useful content among the noise.

## Alternative Approaches

A common solution are handoffs:

```js
const carBrand1Agent = new Agent({...})
const carBrand2Agent = new Agent({...})
...
const agent = new Agent({..., handoffs: [carBrand1Agent, carBrand2Agent, ...]})
```

However, this may not work in the real world. A handoff hands off control to another agent, which contradicts specialization and the potential user query. For example, if the user requests "Give me a financing quote for the carBrandA model A, and the variants of the carBrandB model K", the handoff mechanism will pick one of the agents, therefore satisfying one of the requests and ignoring the other.

A better solution is to use those agents as tools:

```js
const carBrand1Agent = new Agent({...})
const carBrand2Agent = new Agent({...})
...
const agent = new Agent({..., tools: [carBrand1Agent.asTool(), carBrand2Agent.asTool(), ...]})
```

This is better because it can satisfy multiple requests at the same time for different car brands. However, we're in a less dramatic case of the first problem: the more brands we have, the more tools and less accuracy.

## The Agent Switch Pattern

This pattern suggests:

```js
const answerQuestionForBrandTool = tool({
    name: 'answerQuestionForBrand',
    parameters: z.object({
        brand: z.enum(['brandA', 'brandB', 'brandC']), // enum is key
        question: z.string()
    }),
    execute: async (input) => {
        let brandAgent;
        switch (input.brand) { // this is why the pattern is named agentSwitch
            case 'brandA':
                brandAgent = new BrandAAgent({...});
                break;
            case 'brandB':
                brandAgent = new BrandBAgent({...});
                break;
            case 'brandC':
                brandAgent = new BrandCAgent({...});
                break;
            default:
                throw new Error(`Unknown brand: ${input.brand}`);
        }
        const result = await run(brandAgent, input.question);
        return result.finalOutput;
    }
});

const mainAgent = new Agent({
    name: 'mainAgent',
    tools: [answerQuestionForBrandTool, ...]
})
```

## Benefits

This pattern lets the brands scale with flat complexity (or almost). The only thing that grows with more brands is the schema definition of the `brand` parameter, which should be an enum for better type safety and validation.

## When to Use

- You have multiple specialized use cases that share the same interface
- The specialization is based on a categorical parameter (brand, region, product type, etc.)
- You want to avoid prompt bloat while maintaining specialization
- You need to handle multiple requests for different categories in a single conversation

## Trade-offs

**Pros:**
- Flat complexity scaling
- Maintains specialization
- Can handle multiple categories in one conversation
- Clean separation of concerns

**Cons:**
- Agent instantiation overhead on each call
- Requires careful parameter design
- May need lazy loading for performance optimization

## Example Implementation

A complete implementation of this pattern is available in the repository:

📁 **[View on GitHub](https://github.com/Mankind-Technologies/ai-agent-patterns/tree/main/src/patterns/agentSwitch/openai-agent-sdk-ts)**

This implementation demonstrates the core concepts of the Agent Switch Pattern using the OpenAI Agent SDK for TypeScript. It includes:

- Complete source code with TypeScript types
- Configuration options and examples
- Integration with OpenAI Agent SDK
- Test cases and usage scenarios 