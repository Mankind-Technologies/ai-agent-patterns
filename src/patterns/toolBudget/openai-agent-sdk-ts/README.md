# Tool Budget Pattern Example: Research Assistant

This example demonstrates the **Tool Budget Pattern** with a practical research assistant that strategically manages expensive and free tools. The code has been refactored into a modular structure with proper state isolation to prevent budget sharing across runs.

## What This Example Shows

- **Strategic Tool Usage**: The agent learns to use free tools first, expensive tools only when necessary
- **Resource Management**: Prevents runaway costs from poorly prompted agents
- **Transparent Constraints**: Both agent and user understand resource limitations
- **Graceful Degradation**: When budget is exhausted, the agent adapts its approach
- **State Isolation**: Each session gets fresh budget state (no shared state issues)

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

### 4. Run Interactive Mode
```bash
npm run interactive
# OR
npm start -- --interactive
```

### 5. Development Mode (Watch Files)
```bash
npm run dev
```

## Running Modes

### Demo Mode
Runs 5 predefined queries to demonstrate the pattern:
- Shows strategic tool selection
- Demonstrates budget management
- Provides clear analysis of agent decisions

### Interactive Mode
- Ask your own questions
- Type `reset` to clear budget and start fresh
- Type `quit` to exit
- See real-time budget management

## What You'll See

The example demonstrates:

1. **Strategic Decision Making**: Agent tries local search first
2. **Budget Awareness**: Clear tracking of expensive tool usage
3. **Intelligent Prioritization**: Web scraping saved for latest info needs
4. **Graceful Fallback**: When budget exhausted, agent uses alternatives
5. **Transparent Reasoning**: Agent explains its tool choice decisions

## Sample Output

```
🤖 Research Assistant with Tool Budget Pattern
============================================================
This example demonstrates strategic tool usage:
- Web scraping: Expensive, limited to 3 uses per session
- Local search: Free, unlimited
============================================================

🔍 Query 1: Tell me about JavaScript basics and frameworks
--------------------------------------------------
[localSearch] Searching local knowledge for: Tell me about JavaScript basics and frameworks
📋 Response:
I'll help you learn about JavaScript basics and frameworks. Let me search our local knowledge base first since this covers fundamental concepts.

[Using local search - this is free and perfect for basic programming concepts]

Based on our local knowledge:

**JavaScript Basics:**
- JavaScript is a high-level programming language that's dynamically typed and interpreted
- It supports object-oriented, functional, and procedural programming paradigms
- Key features include closures, prototypes, async/await, destructuring, and arrow functions
- ES6 introduced important features like let/const, arrow functions, classes, modules, and template literals

**Popular Frameworks:**
- React, Vue.js, Angular for frontend development
- Node.js for backend development
- The React ecosystem includes Redux for state management, React Router for routing, and Next.js for full-stack development

This information comes from our local knowledge base, so I didn't need to use any expensive web scraping resources. The fundamentals of JavaScript are well-established, making local search perfect for this type of query.

--------------------------------------------------
```

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
- Clean separation of concerns
- Extensible design for new tools

The example demonstrates real-world value by showing how agents can be cost-conscious while maintaining functionality! 