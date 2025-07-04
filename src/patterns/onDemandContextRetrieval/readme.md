# AI Agent Pattern: On-Demand Context Retrieval

> The little brother of a RAG Agent

Sometimes we have to scroll through textual data that is not big enough to justify having a RAG system, or sometimes by the nature of the queried data, it is not needed. Let's say that the scope of the context is on the tens of thousands of tokens (like a long email thread, or technical documentation of a dishwasher, or the step-by-step of a medical procedure), and let's say that the agent needs to read this content. Most of the times the agent is interested in some part or datapoint stated in the context, therefore we build a tool to give this context to the agent:

## The Naive Approach

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

A better solution, sometimes, is to make an agent to query the content:

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

const docsAgent = new Agent({
    name: 'docsAgent',
    instruction: 'Your task is to retrieve the documentation and answer the question. Extract only the relevant information needed to answer the query.',
    tools: [naiveDocsTool]
})

const agent = new Agent({name: 'main', tools: [docsAgent.asTool(), ...]})
```

### How It Works

1. **docsAgent**: Performs heavy lifting in a single turn
   - Loads the full context (10k tokens)
   - Extracts relevant information (100 tokens)
   - Returns condensed response and exits
   
2. **mainAgent**: Works with light memory across multiple turns
   - Receives only the relevant extracted info
   - Continues conversation without carrying full context weight

### Example Interaction

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
- **One-off queries** - that is, agents that do 1 or 2 turns, the overhead isn't justified

## Token Savings Simulation

Let's say that the context is 10k tokens long and the interesting information is 100 tokens, also the agent performs 10 turns, and the agent is accessing this context on the first turn.

### Without the pattern:

- **Turn 1**: 10k tokens (full context) + 100 tokens (query) = 10,100 tokens
- **Turn 2**: 10k tokens (context) + 100 tokens (previous) + 100 tokens (new query) = 10,200 tokens
- **Turn 3**: 10k tokens (context) + 200 tokens (history) + 100 tokens (new query) = 10,300 tokens
- **...continuing this pattern...**
- **Turn 10**: 10k tokens (context) + 900 tokens (history) + 100 tokens (new query) = 11,000 tokens

**Total input tokens across 10 turns**: ~105,500 tokens

### With the pattern:

- **docsAgent turn**: 10k tokens (context) + 100 tokens (query) = 10,100 tokens
- **Main agent turn 1**: 100 tokens (extracted info) + 100 tokens (query) = 200 tokens
- **Main agent turn 2**: 100 tokens (extracted info) + 100 tokens (history) + 100 tokens (new query) = 300 tokens
- **Main agent turn 3**: 100 tokens (extracted info) + 200 tokens (history) + 100 tokens (new query) = 400 tokens
- **...continuing this pattern...**
- **Main agent turn 10**: 100 tokens (extracted info) + 900 tokens (history) + 100 tokens (new query) = 1,100 tokens

**Total input tokens**: 10,100 + 200 + 300 + 400 + 500 + 600 + 700 + 800 + 900 + 1,000 + 1,100 = ~16,600 tokens

**Savings**: ~84% reduction in token usage (105,500 → 16,600 tokens)
