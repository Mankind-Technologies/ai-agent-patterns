# Tool Budget Pattern Example: Research Assistant

This example demonstrates the **Tool Budget Pattern** with a practical research assistant that strategically manages expensive and free tools. The code has been refactored into a modular structure with proper state isolation to prevent budget sharing across runs.

## Pattern Concept

The **Tool Budget Pattern** is a resource management technique that wraps expensive tools with usage limits, forcing agents to make strategic decisions about when and how to use costly operations.

### How It Works

1. **Wrapper Function**: A `budget()` function decorates expensive tools with usage tracking
2. **Hard Limits**: Tools become unusable after reaching their limit (e.g., 3 uses)
3. **Feedback Loop**: Each tool call returns remaining usage count to the agent
4. **Strategic Pressure**: Agents must prioritize which tasks deserve expensive resources

### Why It's Effective

Without budget constraints, agents tend to:
- Use expensive tools for every query (even when unnecessary)
- Exhaust resources early in conversations
- Ignore cost-effective alternatives

With budget constraints, agents learn to:
- **Try free alternatives first** (local search, cached data)
- **Save expensive resources** for high-value tasks
- **Explain their reasoning** about tool selection
- **Gracefully degrade** when resources are depleted

### Core Mechanism

The pattern works by intercepting tool execution and maintaining a usage counter:

```typescript
function budget(tool, options) {
    let usageCount = 0;
    // Intercept tool.execute()
    // Track usage, enforce limits
    // Provide feedback to agent
}
```

This creates **artificial scarcity** that drives **strategic behavior** - the same psychological principle that makes agents more thoughtful about resource allocation.

## Basic Implementation

Here's the minimal code needed to implement the budget pattern:

```typescript
// Core budget function
function budget(tool: any, options: {maxTimes: number}) {
    let timesUsed = 0;
    const originalExecute = tool.execute;
    
    tool.execute = async (input: any, context: any) => {
        if (timesUsed >= options.maxTimes) {
            return { 
                budget: `Tool limit reached (${options.maxTimes} uses)`,
                error: "BUDGET_EXCEEDED"
            };
        }
        
        timesUsed++;
        const result = await originalExecute(input, context);
        
        if (result && typeof result === "object") {
            return { 
                ...result, 
                budget: `${options.maxTimes - timesUsed} uses remaining` 
            };
        }
        return result;
    };
    
    tool.description = `${tool.description}\n\n[BUDGET] Limited to ${options.maxTimes} uses.`;
    return tool;
}

// Usage
const budgetedTool = tool(budget({
    name: "expensiveTool",
    description: "An expensive operation",
    parameters: z.object({ query: z.string() }),
    execute: async (input) => {
        // Expensive operation here
        return { result: "expensive data" };
    }
}), { maxTimes: 3 });

// Use in agent
const agent = new Agent({
    tools: [budgetedTool, otherFreeTool],
    // ... other config
});
```

**That's it!** For a production-ready implementation with state management, tracking, and comparison features, see the files in this example.

## What This Example Shows

- **Strategic Tool Usage**: The agent learns to use free tools first, expensive tools only when necessary
- **Resource Management**: Prevents runaway costs from poorly prompted agents
- **Transparent Constraints**: Both agent and user understand resource limitations
- **Graceful Degradation**: When budget is exhausted, the agent adapts its approach
- **State Isolation**: Each session gets fresh budget state (no shared state issues)
- **🆕 Side-by-Side Comparison**: See exactly how budget constraints change agent behavior

## Project Structure

```
src/
├── budget.ts         # Budget pattern implementation with state management
├── knowledge-base.ts # Local knowledge database (free resource)
├── tools.ts          # Tool definitions (expensive web scraping + free local search)
└── config.ts         # Agent instructions and configuration
index.ts              # Main application with demo and interactive modes
```

## Tools Available

1. **Web Scraping** (Limited to 3 uses per session)
   - Simulates expensive network operations
   - Provides latest information from external sources
   - Takes time and resources to process

2. **Local Search** (Unlimited)
   - Searches through local knowledge base
   - Instant responses with no cost
   - Good for basic concepts and known information

## Key Features

- **Budget State Isolation**: Each run gets fresh budget counters
- **Interactive Mode**: Ask your own questions and see budget management in action
- **🆕 Comparison Mode**: Run the same queries with/without budget constraints
- **Comprehensive Tracking**: See tool usage statistics and cost analysis
- **Modular Design**: Easy to extend with new tools or knowledge
- **Comprehensive Logging**: See exactly how the agent makes decisions
- **Error Handling**: Graceful handling of budget exhaustion

## How to Run

### 1. Install Dependencies
```bash
npm install
```

### 2. Set OpenAI API Key
```bash
export OPENAI_API_KEY="your-api-key-here"
```

### 3. Run Demo Mode (Default)
```bash
npm start
```

### 4. Run Comparison Mode ⭐ **NEW**
```bash
npm run compare
# OR
npm start -- --compare
```

### 5. Run Interactive Mode
```bash
npm run interactive
# OR
npm start -- --interactive
```

### 6. Development Mode (Watch Files)
```bash
npm run dev
```

## Running Modes

### Demo Mode
Runs 5 predefined queries to demonstrate the pattern:
- Shows strategic tool selection
- Demonstrates budget management
- Provides clear analysis of agent decisions

### 🆕 Comparison Mode ⭐
**This is the most valuable mode!** It runs the same queries twice:
1. **Phase 1**: With budget constraints (strategic agent)
2. **Phase 2**: Without budget constraints (unlimited agent)
3. **Analysis**: Side-by-side comparison of tool usage patterns

**What you'll see:**
- Budgeted agent uses more free local search
- Unlimited agent uses more expensive web scraping
- Cost difference analysis
- Strategic vs. wasteful behavior comparison

### Interactive Mode
- Ask your own questions
- Type `reset` to clear budget and start fresh
- Type `quit` to exit
- See real-time budget management

## 🔬 Comparison Mode Output

The comparison mode shows a detailed analysis like this:

```
📊 Side-by-Side Comparison:
┌─────────────────────┬─────────────────┬─────────────────┬─────────────────┐
│ Metric              │ Budgeted Agent  │ Unlimited Agent │ Difference      │
├─────────────────────┼─────────────────┼─────────────────┼─────────────────┤
│ Web Scraping Calls  │ 3               │ 5               │ +2              │
│ Local Search Calls  │ 7               │ 2               │ -5              │
│ Total Cost          │ $0.30           │ $0.50           │ +$0.20          │
│ Total Time (s)      │ 8.1             │ 12.3            │ +4.2            │
└─────────────────────┴─────────────────┴─────────────────┴─────────────────┘

🔍 Key Insights:
✅ Budget Pattern SUCCESS: Reduced expensive web scraping by 2 calls
💰 Cost Savings: $0.20 saved by using budget constraints
🎯 Strategic Behavior: Budgeted agent used more free local search
📊 Cost Reduction: 40.0% reduction in operational costs
```

## What You'll See

The example demonstrates:

1. **Strategic Decision Making**: Agent tries local search first
2. **Budget Awareness**: Clear tracking of expensive tool usage
3. **Intelligent Prioritization**: Web scraping saved for latest info needs
4. **Graceful Fallback**: When budget exhausted, agent uses alternatives
5. **Transparent Reasoning**: Agent explains its tool choice decisions
6. **🆕 Quantified Value**: Exact measurements of cost savings and efficiency gains

## Why Comparison Mode is Valuable

The comparison mode **proves the pattern works** by showing:

- **Behavioral Change**: Same queries, different tool usage patterns
- **Cost Impact**: Exact dollar savings from budget constraints
- **Strategic Thinking**: How constraints force smarter decisions
- **Quality Maintenance**: Results remain good despite using cheaper tools
- **Resource Efficiency**: Better utilization of available tools

## Sample Comparison Results

**Typical Pattern:**
- **Budgeted Agent**: 3 web scrapes + 5 local searches = $0.30
- **Unlimited Agent**: 7 web scrapes + 1 local search = $0.70
- **Savings**: $0.40 (57% cost reduction)

**Key Insight**: The budget pattern doesn't just limit usage - it teaches agents to be strategic!

## Customization Options

### Adjust Budget Limits
```typescript
// In src/config.ts
export const DEMO_CONFIG = {
    maxWebScrapeUses: 5, // Increase budget
    // ... other options
};
```

### Add New Knowledge
```typescript
// In src/knowledge-base.ts
export const localKnowledgeBase = {
    "newTopic": {
        "subtopic": "Your knowledge here..."
    },
    // ... existing topics
};
```

### Modify Agent Strategy
```typescript
// In src/config.ts
export const AGENT_INSTRUCTIONS = `
    // Customize the agent's decision-making strategy
`;
```

## Real-World Applications

This pattern is valuable for:
- **API Rate Limiting**: Prevent hitting expensive API limits
- **Cloud Resource Management**: Control cloud computing costs
- **Content Generation**: Limit expensive AI operations
- **Data Processing**: Balance between expensive real-time and free cached data
- **Development Tools**: Limit costly cloud operations while allowing local builds/tests

## Technical Details

### Budget State Management
- Each tool instance gets a unique ID
- State stored in a registry to prevent sharing
- `clearAllBudgets()` function for clean starts
- Proper error handling when budget exceeded

### Tool Architecture
- Factory pattern for creating budgeted tools
- Decorator pattern for adding budget constraints
- Usage tracking with detailed metrics
- Clean separation of concerns
- Extensible design for new tools

### Comparison Architecture
- Separate agent instances for fair comparison
- Independent tracking systems
- Controlled query execution
- Statistical analysis of differences

## 🎯 Key Takeaway

**The comparison mode proves that budget constraints don't just limit costs - they make agents smarter!** 

The budgeted agent learns to:
- Use free resources first
- Save expensive resources for high-value tasks
- Maintain quality while reducing costs
- Be transparent about resource usage

This is the **real value** of the Tool Budget Pattern - not just cost control, but **strategic intelligence**! 