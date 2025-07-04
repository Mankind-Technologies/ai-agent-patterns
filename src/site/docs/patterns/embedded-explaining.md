---
sidebar_position: 3
---

# Embedded Explaining Pattern

<div className="badges">
<span className="badge badge--agent">Observability</span>
<span className="badge badge--pattern">Decision Quality</span>
<span className="badge badge--tool">Transparency</span>
</div>

The Embedded Explaining Pattern requires AI agents to provide clear justification for each tool call, increasing observability and improving decision quality.

## Problem

AI agents often make tool calls without providing clear justification for their decisions. This creates several challenges:

- **Debugging Difficulty**: When agents make unexpected tool calls, it's hard to understand why
- **Trust Issues**: Users can't trust decisions they don't understand
- **Quality Concerns**: Agents may make thoughtless tool selections
- **Compliance Gaps**: Regulated industries often require decision explanations
- **Learning Barriers**: Humans can't learn from agent approaches without understanding the reasoning

## Solution

The Embedded Explaining Pattern adds a "why" parameter to tools that requires agents to explain:

1. **Goal**: What the agent is trying to achieve
2. **Justification**: Why this specific tool is the best choice
3. **Context**: What makes this tool call necessary right now
4. **Expected Outcome**: What the agent expects to accomplish

## Implementation

### Core Concept

```typescript
interface ExplainedToolInput<T> {
  // Original tool parameters
  ...T;
  // Added explanation requirement
  why: string;
}

interface ExplainedToolOutput<T> {
  // Original tool output
  ...T;
  // Added explanation tracking
  explanation: string;
  reasoning: string;
}

function withExplanation<T extends Tool>(tool: T): ExplainedTool<T> {
  // Implementation wraps tool with explanation requirements
}
```

### Basic Example

```typescript
import { withExplanation } from './patterns/embedded-explaining';

// Original tool
const webScrapingTool = {
  name: "scrapeUrl",
  description: "Scrapes content from web URLs",
  execute: async (input: { url: string; topic: string }) => {
    const content = await scrapeWebsite(input.url);
    return {
      content,
      success: true,
      source: input.url
    };
  }
};

// Add explanation requirement
const explainedScraper = withExplanation(webScrapingTool);

// The description is automatically enhanced
console.log(explainedScraper.description);
// "Scrapes content from web URLs
// 
// [EXPLANATION REQUIRED] You must provide a clear explanation 
// of why this action is justified and what goal it serves."
```

### Usage with Explanations

```typescript
// Agent must now provide reasoning
const result = await explainedScraper.execute({
  url: "https://example.com/ai-news",
  topic: "AI developments",
  why: "Need current AI news since local knowledge may be outdated and user specifically asked for latest developments"
});

console.log(result);
// {
//   content: "Latest AI developments...",
//   success: true,
//   source: "https://example.com/ai-news",
//   explanation: "Need current AI news since local knowledge may be outdated...",
//   reasoning: "Agent justified web scraping for time-sensitive information"
// }
```

## Real-World Example

Here's how the pattern works in a research assistant scenario:

### Enhanced Tools Setup

```typescript
import { withExplanation } from './patterns/embedded-explaining';

// Free tool with explanation
const explainedLocalSearch = withExplanation({
  name: "localSearch",
  description: "Searches local knowledge base",
  execute: async (input: { query: string; why: string }) => {
    const results = await searchLocalKnowledge(input.query);
    return {
      results,
      source: "local-database",
      explanation: input.why,
      reasoning: "Agent chose local search as primary information source"
    };
  }
});

// Expensive tool with explanation
const explainedWebScraper = withExplanation({
  name: "webScraper", 
  description: "Scrapes current web information",
  execute: async (input: { url: string; topic: string; why: string }) => {
    const content = await scrapeWebsite(input.url);
    return {
      content,
      source: input.url,
      processingTime: 2.1,
      explanation: input.why,
      reasoning: "Agent justified expensive web scraping operation"
    };
  }
});
```

### Agent with Explaining Tools

```typescript
const agent = new Agent({
  apiKey: process.env.OPENAI_API_KEY,
  tools: [explainedLocalSearch, explainedWebScraper],
  systemPrompt: `
    You are a research assistant. For every tool call, you must:
    
    1. Explain WHY you're using that specific tool
    2. What information you expect to find
    3. Why this tool is better than alternatives for this task
    4. How this fits your overall research strategy
    
    Be specific and thoughtful in your explanations.
  `
});

// Example conversation
const response = await agent.run(
  "What are the latest developments in quantum computing?"
);

// Agent would make calls like:
// localSearch({ 
//   query: "quantum computing basics", 
//   why: "First checking local knowledge for foundational context before seeking latest developments"
// })
// 
// webScraper({ 
//   url: "https://quantum-news.com", 
//   topic: "quantum computing",
//   why: "Local search provided good background but user specifically wants 'latest' developments which requires current web information"
// })
```

## Pattern Variations

### Explanation Levels

```typescript
enum ExplanationLevel {
  Basic = "basic",      // Simple one-sentence explanation
  Detailed = "detailed", // Multi-sentence reasoning
  Strategic = "strategic" // Full strategic context
}

const explainedTool = withExplanation(originalTool, {
  level: ExplanationLevel.Detailed,
  minimumWords: 10,
  requiresContext: true
});
```

### Explanation Validation

```typescript
const validatedExplanationTool = withExplanation(originalTool, {
  validateExplanation: (explanation: string) => {
    if (explanation.length < 20) {
      throw new Error("Explanation too brief - provide more detail");
    }
    if (!explanation.includes("because")) {
      throw new Error("Explanation must include reasoning with 'because'");
    }
    return true;
  }
});
```

### Explanation Templates

```typescript
const templatedTool = withExplanation(originalTool, {
  explanationTemplate: {
    goal: "What I'm trying to achieve",
    justification: "Why this tool is the best choice", 
    alternatives: "Why I'm not using other options",
    expected: "What I expect to find"
  }
});
```

## Key Benefits

### 1. **Enhanced Debugging**
```typescript
// When something goes wrong, you can see the reasoning
const failedCall = await explainedTool.execute({
  query: "obscure topic",
  why: "User asked for comprehensive information"
});

if (!failedCall.success) {
  console.log("Tool failed after reasoning:", failedCall.explanation);
  // "User asked for comprehensive information" 
  // → Shows agent misunderstood that local search would be sufficient
}
```

### 2. **Quality Improvement**
```typescript
// Agents make better decisions when forced to explain
const betterDecision = await explainedTool.execute({
  query: "basic math",
  why: "This is fundamental information that should be in local knowledge, so web scraping would be wasteful"
});
// Agent chooses more appropriately when required to justify
```

### 3. **Audit Trail**
```typescript
// Complete decision history for compliance
const auditLog = explanationHistory.map(call => ({
  timestamp: call.timestamp,
  tool: call.toolName,
  decision: call.explanation,
  outcome: call.success
}));
```

### 4. **User Trust**
```typescript
// Users can see and understand agent reasoning
function displayAgentReasoning(result: any) {
  return `
    Agent used ${result.tool} because: ${result.explanation}
    Result: ${result.success ? 'Success' : 'Failed'}
  `;
}
```

## Advanced Configuration

### Explanation Aggregation

```typescript
class ExplanationMonitor {
  private explanations: ExplanationEntry[] = [];
  
  trackExplanation(toolName: string, explanation: string, outcome: any) {
    this.explanations.push({
      toolName,
      explanation,
      outcome,
      timestamp: new Date(),
      quality: this.assessExplanationQuality(explanation)
    });
  }
  
  getDecisionSummary(): string {
    return this.explanations
      .map(e => `${e.toolName}: ${e.explanation}`)
      .join('\n');
  }
  
  assessExplanationQuality(explanation: string): number {
    // Score explanation quality based on length, keywords, specificity
    let score = 0;
    score += explanation.length > 50 ? 20 : 10;
    score += explanation.includes('because') ? 20 : 0;
    score += explanation.includes('need') || explanation.includes('want') ? 15 : 0;
    // ... more criteria
    return Math.min(score, 100);
  }
}
```

### Context-Aware Explanations

```typescript
const contextualTool = withExplanation(originalTool, {
  contextProvider: (input: any) => ({
    previousCalls: getRecentToolCalls(),
    userGoal: getCurrentUserGoal(),
    systemState: getSystemState()
  }),
  
  explanationEnhancer: (explanation: string, context: any) => {
    return `${explanation} (Context: ${context.previousCalls.length} previous calls, goal: ${context.userGoal})`;
  }
});
```

## Integration with Other Patterns

### With Tool Budget Pattern

```typescript
const budgetedExplainedTool = withExplanation(
  budget(expensiveTool, { maxTimes: 3 }), 
  {
    requireBudgetJustification: true,
    budgetAwareTemplate: "Given limited uses ({{remaining}} left), I'm using this tool because: {{explanation}}"
  }
);
```

### With Retry Pattern

```typescript
const explainedRetryTool = withExplanation(
  withRetry(unreliableTool, { maxRetries: 3 }),
  {
    retryExplanations: true,
    explanationOnRetry: "Retrying because: previous attempt failed and {{explanation}}"
  }
);
```

## Best Practices

### 1. **Clear Explanation Requirements**
```typescript
const wellDefinedTool = withExplanation(tool, {
  explanationGuidance: `
    Explain:
    - What specific information you need
    - Why this tool is the best choice
    - What you expect to find
    - How this serves the user's goal
  `
});
```

### 2. **Explanation Quality Control**
```typescript
const qualityControlledTool = withExplanation(tool, {
  minimumQualityScore: 70,
  requireKeywords: ['because', 'need', 'goal'],
  prohibitedPhrases: ['just because', 'seems good'],
  
  qualityFeedback: (score: number) => {
    if (score < 50) return "Explanation too vague - be more specific";
    if (score < 70) return "Good explanation but could be more detailed";
    return "Excellent explanation";
  }
});
```

### 3. **Progressive Explanation Depth**
```typescript
const adaptiveTool = withExplanation(tool, {
  adaptiveDepth: true,
  
  getRequiredDepth: (context: any) => {
    // Require more explanation for expensive operations
    if (context.toolCost > 1.0) return ExplanationLevel.Strategic;
    if (context.isRetry) return ExplanationLevel.Detailed;
    return ExplanationLevel.Basic;
  }
});
```

## Common Use Cases

### 1. **Healthcare Diagnostics**
```typescript
const diagnosticTool = withExplanation(medicalAnalysisTool, {
  explanationTemplate: {
    symptomAnalysis: "Based on these symptoms, I need to check...",
    riskAssessment: "The risk factors suggest...",
    recommendedAction: "This diagnostic approach is appropriate because..."
  }
});
```

### 2. **Financial Trading**
```typescript
const tradingTool = withExplanation(marketAnalysisTool, {
  explanationTemplate: {
    marketConditions: "Current market conditions indicate...",
    riskJustification: "This risk level is appropriate because...",
    expectedOutcome: "Based on analysis, I expect..."
  }
});
```

### 3. **Customer Service**
```typescript
const supportTool = withExplanation(customerResolutionTool, {
  explanationTemplate: {
    problemAnalysis: "Based on the customer's issue...",
    solutionChoice: "This resolution approach is best because...",
    alternativesConsidered: "I chose this over other options because..."
  }
});
```

## Troubleshooting

### Common Issues

#### Explanations Too Generic
```typescript
// Problem: Agent gives vague explanations
"why": "Need information"

// Solution: Use explanation validation
const improvedTool = withExplanation(tool, {
  minimumWords: 15,
  requireSpecifics: true,
  validationPrompt: "Be specific about what information you need and why"
});
```

#### Over-Explanation
```typescript
// Problem: Explanations become too verbose
"why": "I need to search for information because the user asked a question and I want to provide a good answer..."

// Solution: Set length limits and guidance
const balancedTool = withExplanation(tool, {
  maxWords: 30,
  guidance: "Be concise but specific - focus on the key reason"
});
```

#### Missing Strategic Context
```typescript
// Problem: Explanations don't show broader strategy
"why": "Need to search for cats"

// Solution: Require strategic context
const strategicTool = withExplanation(tool, {
  requireContext: ['user goal', 'previous attempts', 'why this tool vs alternatives']
});
```

## Testing Explanations

```typescript
describe('Explanation Quality', () => {
  it('should require meaningful explanations', async () => {
    const result = await explainedTool.execute({
      query: 'test',
      why: 'just because' // Should be rejected
    });
    
    expect(result.error).toContain('explanation quality');
  });
  
  it('should accept detailed explanations', async () => {
    const result = await explainedTool.execute({
      query: 'test',
      why: 'Need to verify test functionality because user reported specific error with this feature'
    });
    
    expect(result.success).toBe(true);
    expect(result.explanation).toBeDefined();
  });
});
```

## Next Steps

1. **Implement the Pattern**: Start by adding explanations to your most critical tools
2. **Monitor Quality**: Track explanation quality and adjust requirements
3. **Gather Feedback**: See how explanations help with debugging and trust
4. **Expand Coverage**: Add explanations to more tools based on value

## Related Patterns

- [Tool Budget Pattern](./tool-budget.md) - Combine explanations with cost justification
- **Audit Pattern** - Use explanations for compliance and auditing
- **Retry Logic Pattern** - Explain why retries are appropriate
- **Decision Tree Pattern** - Document decision branching with explanations 