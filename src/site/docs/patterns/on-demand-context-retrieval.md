---
sidebar_position: 6
---

# On-Demand Context Retrieval

> **The little brother of a RAG Agent**

Sometimes we have to scroll through textual data that is not big enough to justify having a RAG system, or sometimes by the nature of the queried data, it is not needed. This pattern provides an efficient way to handle medium-sized documents by using a specialized agent to extract only relevant information.

## Problem

Let's say that the scope of the context is on the tens of thousands of tokens (like a long email thread, or technical documentation of a dishwasher, or the step-by-step of a medical procedure), and the agent needs to read this content. Most of the time the agent is interested in some part or datapoint stated in the context.

### The Naive Approach

```js
const naiveDocsTool = tool({
    name: 'docs',
    parameters: z.object({
        model: z.enum(['abc', 'bsks', ...])
    }),
    execute: (item) => {
        return getTextContent(item.model);
    }
});

const agent = new Agent({name: 'main', tools: [naiveDocsTool, ...]})
```

This will load all the tokens in the agent self-conversation with the tools and other agents, and carry those tokens as input tokens along all conversation turns until completion. This may be expensive, slow, and may degrade agent performance.

## The On-Demand Context Retrieval Pattern

A better solution is to make a specialized agent query the content and extract only what's needed:

```js
const docsAgent = new Agent({
    name: 'docsAgent',
    instruction: 'Your task is to retrieve the documentation and answer the question. Extract only the relevant information needed to answer the query.',
    tools: [naiveDocsTool]
})

const agent = new Agent({name: 'main', tools: [docsAgent.asTool(), ...]})
```

## How It Works

1. **docsAgent**: Performs heavy lifting in a single turn
   - Loads the full context (10k tokens)
   - Extracts relevant information (100 tokens)
   - Returns condensed response and exits
   
2. **mainAgent**: Works with light memory across multiple turns
   - Receives only the relevant extracted info
   - Continues conversation without carrying full context weight

## Example Interaction

```js
// Input: 10k token dishwasher manual
// User query: "What does error code E3 mean?"

// docsAgent processes full manual and extracts:
// "Error code E3 indicates water pump failure. Replace part #XYZ-123. 
//  Located behind bottom panel. Requires Phillips screwdriver."

// mainAgent continues with just 50 tokens instead of 10k tokens
```

## Benefits

- **Memory Efficiency**: Main agent's working memory stays light across multiple turns
- **Cost Optimization**: Reduces token usage significantly in multi-turn conversations
- **Performance**: Faster processing with smaller context windows
- **Clean Separation**: Context retrieval vs. task execution are separated

## When to Use This Pattern

- **Medium-sized documents** (thousands to tens of thousands of tokens)
- **Multi-turn conversations** where context persists
- **Specific information retrieval** from larger documents
- **Cost-sensitive applications** where token efficiency matters

## When NOT to Use

- **Small contexts** (< 1k tokens) - direct loading is more efficient
- **Large corpora** requiring semantic search - use full RAG instead
- **One-off queries** - agents that do 1 or 2 turns, the overhead isn't justified

## Token Savings Analysis

Let's analyze a scenario with 10k token context, 100 tokens of relevant info, and 10 conversation turns:

### Without the pattern:
- **Turn 1**: 10k + 100 = 10,100 tokens
- **Turn 2**: 10k + 200 = 10,200 tokens
- **Turn 10**: 10k + 1,000 = 11,000 tokens
- **Total**: ~105,500 tokens

### With the pattern:
- **docsAgent**: 10,100 tokens (one-time)
- **Main agent turns**: 200 + 300 + ... + 1,100 = 6,500 tokens
- **Total**: ~16,600 tokens

**Result**: ~84% reduction in token usage

## Examples

- [On-Demand Context Retrieval with OpenAI Agent SDK (TypeScript)](../examples/on-demand-context-retrieval-openai-ts) 