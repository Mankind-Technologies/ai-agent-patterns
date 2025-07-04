/**
 * Embedded Explaining Pattern - Research Assistant
 * 
 * This example demonstrates the embedded explaining pattern using a real OpenAI agent.
 * The agent requires explanations for expensive tool usage, providing transparency
 * and encouraging strategic decision-making.
 * 
 * Prerequisites:
 * 1. Run: npm install
 * 2. Set OPENAI_API_KEY environment variable
 * 
 * The agent learns to justify its tool usage by providing clear explanations
 * for each action, improving observability and decision quality.
 */

import { Agent, run, tool } from "@openai/agents";
import { withExplanation } from "./src/explaining";
import { config } from "./src/config";
import { generateExplanationSummary, clearExplanationHistory } from "./src/explaining";
import { baseWebScrapeTool, baseLocalSearchTool } from "./src/tools";

const log = true;
const logger = (message: string) => log && console.log(message);

// Agent instructions
const AGENT_INSTRUCTIONS = `You are a research assistant that helps users find information efficiently.

IMPORTANT: You have access to two types of tools:
1. Web scraping (EXPENSIVE) - Requires clear explanation for each use
2. Local search (FREE) - No explanation required, but good practice

EXPLANATION REQUIREMENTS:
- For web scraping: You MUST provide a clear explanation in the 'why' parameter
- Explain why web scraping is necessary vs. using local search
- Be specific about what information you're seeking and why it's important
- Consider the cost and justify the expense

DECISION FRAMEWORK:
- For basic programming concepts: Use local search first
- For latest updates/releases: Web scraping may be justified
- For multiple related queries: Be strategic about which ones need web scraping
- Always explain your reasoning when using expensive tools

SUGGESTED URLS FOR WEB SCRAPING:
- JavaScript: https://developer.mozilla.org
- React: https://react.dev
- Python: https://python.org
- AI Research: https://arxiv.org
- General Tech: https://github.com

Your goal is to provide accurate information while being thoughtful about tool usage and always explaining your decision-making process.`;

const AGENT_INSTRUCTIONS_NO_EXPLANATION = `You are a research assistant that helps users find information efficiently.

TOOLS AVAILABLE:
- Web scraping: Get the latest information from external sources
- Local search: Search through local knowledge base

Your strategy should be:
1. Use the most appropriate tool for each query
2. Web scraping provides the most up-to-date information
3. Local search is good for basic concepts
4. Choose tools based on what will give the best results

SUGGESTED URLS FOR WEB SCRAPING:
- JavaScript: https://developer.mozilla.org
- React: https://react.dev
- Python: https://python.org
- AI Research: https://arxiv.org
- General Tech: https://github.com

Your goal is to provide the most accurate information possible.`;

// Test queries
const TEST_QUERIES = [
    "Tell me about JavaScript basics and frameworks",
    "What are the latest React features and updates?",
    "I need information about Python for data science",
    "What are the newest AI research developments?",
    "Explain React hooks and their usage"
];

async function runSingleQuery(agent: Agent, query: string, queryNumber: number) {
    console.log(`\n🔍 Query ${queryNumber}: ${query}`);
    console.log("-".repeat(50));
    
    try {
        const result = await run(agent, query);
        console.log("📋 Response:");
        console.log(result.finalOutput);
    } catch (error) {
        console.error("❌ Error:", error);
    }
    
    console.log("-".repeat(50));
}

async function runWithExplanations() {
    console.log("📝 PHASE 1: Agent with EXPLANATION REQUIREMENTS");
    console.log("=".repeat(60));
    console.log("This agent must provide explanations for expensive tool usage.");
    console.log("=".repeat(60));
    
    // Clear any existing explanation histories
    clearExplanationHistory();
    
    // Create tools with explanation requirements
    const explainedWebScrapeTool = tool(withExplanation(baseWebScrapeTool, {
        requireExplanation: true,
        explanationPrompt: "Explain why web scraping is necessary and what specific information you're seeking",
        includeReasoningInOutput: true
    }));
    
    const explainedLocalSearchTool = tool(withExplanation(baseLocalSearchTool, {
        requireExplanation: false, // Local search is free, so explanation is optional
        explanationPrompt: "Explain why you're using local search",
        includeReasoningInOutput: false
    }));
    
    const explainedAgent = new Agent({
        name: "ExplainedResearchAssistant",
        model: "gpt-4o-mini",
        instructions: AGENT_INSTRUCTIONS,
        tools: [explainedWebScrapeTool, explainedLocalSearchTool],
    });
    
    // Run test queries
    for (let i = 0; i < TEST_QUERIES.length; i++) {
        await runSingleQuery(explainedAgent, TEST_QUERIES[i], i + 1);
        
        if (i < TEST_QUERIES.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }
    
    console.log("\n📊 EXPLANATION SUMMARY:");
    console.log("=".repeat(50));
    console.log(generateExplanationSummary());
    console.log("=".repeat(50));
}

async function runWithoutExplanations() {
    console.log("\n🔓 PHASE 2: Agent WITHOUT EXPLANATION REQUIREMENTS");
    console.log("=".repeat(60));
    console.log("This agent can use tools without providing explanations.");
    console.log("=".repeat(60));
    
    const regularAgent = new Agent({
        name: "RegularResearchAssistant",
        model: "gpt-4o-mini",
        instructions: AGENT_INSTRUCTIONS_NO_EXPLANATION,
        tools: [tool(baseWebScrapeTool), tool(baseLocalSearchTool)],
    });
    
    // Run test queries
    for (let i = 0; i < TEST_QUERIES.length; i++) {
        await runSingleQuery(regularAgent, TEST_QUERIES[i], i + 1);
        
        if (i < TEST_QUERIES.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }
}

async function runComparison() {
    console.log("🔬 EMBEDDED EXPLAINING PATTERN COMPARISON");
    console.log("=".repeat(70));
    console.log("This comparison shows how the same agent behaves with and without");
    console.log("explanation requirements for tool usage.");
    console.log("=".repeat(70));
    
    await runWithExplanations();
    await new Promise(resolve => setTimeout(resolve, 2000));
    await runWithoutExplanations();
    
    console.log("\n🎯 PATTERN COMPARISON RESULTS");
    console.log("=".repeat(70));
    console.log(`
🔍 **Key Differences Observed:**

WITH EXPLANATION REQUIREMENTS:
✅ Transparent decision-making process
✅ Justified tool usage with clear reasoning
✅ More strategic thinking about expensive operations
✅ Better audit trail of agent decisions
✅ Encourages cost-conscious behavior

WITHOUT EXPLANATION REQUIREMENTS:
⚠️  Less transparent decision-making
⚠️  No insight into tool selection reasoning
⚠️  May use expensive tools without justification
⚠️  Harder to debug or optimize behavior
⚠️  Less strategic thinking about resource usage

🎯 **Embedded Explaining Pattern Benefits:**
1. 🔍 **Transparency**: Clear reasoning for each tool use
2. 📊 **Quality**: Forces deliberate decision-making
3. 🐛 **Debugging**: Easy to understand agent behavior
4. 💰 **Cost Control**: Encourages strategic tool usage
5. 🎛️ **Flexibility**: Can be applied to any tool selectively
`);
}

async function runInteractiveMode() {
    console.log("\n🎮 INTERACTIVE MODE");
    console.log("=".repeat(50));
    console.log("Ask questions to see the explaining pattern in action!");
    console.log("Type 'quit' to exit.");
    console.log("=".repeat(50));
    
    const readline = require('readline');
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    
    // Create agent with explained tools
    const explainedWebScrapeTool = withExplanation(baseWebScrapeTool);
    const explainedLocalSearchTool = withExplanation(baseLocalSearchTool, {
        requireExplanation: false
    });
    
    const interactiveAgent = new Agent({
        name: "InteractiveResearchAssistant",
        model: "gpt-4o-mini",
        instructions: AGENT_INSTRUCTIONS,
        tools: [explainedWebScrapeTool, explainedLocalSearchTool],
    });
    
    const askQuestion = () => {
        rl.question('\n❓ Your question: ', async (question: string) => {
            if (question.toLowerCase() === 'quit') {
                rl.close();
                return;
            }
            
            try {
                const result = await run(interactiveAgent, question);
                console.log("📋 Response:");
                console.log(result.finalOutput);
                console.log("\n" + generateExplanationSummary());
            } catch (error) {
                console.error("❌ Error:", error);
            }
            
            askQuestion();
        });
    };
    
    askQuestion();
}

async function main() {
    try {
        console.log("🔍 Embedded Explaining Pattern Demo");
        console.log("=".repeat(60));
        console.log("This demo shows how to add explanation requirements to tools,");
        console.log("improving transparency and decision quality in AI agents.");
        console.log("=".repeat(60));
        
        // Show configuration
        console.log("\n📋 Configuration:");
        console.log(config.getSummary());
        
        const args = process.argv.slice(2);
        const mode = args[0] || 'comparison';
        
        switch (mode) {
            case 'comparison':
                await runComparison();
                break;
            case 'explained':
                await runWithExplanations();
                break;
            case 'regular':
                await runWithoutExplanations();
                break;
            case 'interactive':
                await runInteractiveMode();
                break;
            default:
                console.log("Available modes: comparison, explained, regular, interactive");
                break;
        }
        
        console.log("\n✅ Demo completed successfully!");
        console.log("\nℹ️  Run with different modes:");
        console.log("  npm start comparison  - Compare explained vs regular agents");
        console.log("  npm start explained   - Run only with explanation requirements");
        console.log("  npm start regular     - Run only without explanation requirements");
        console.log("  npm start interactive - Interactive mode for testing");
        
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error("❌ Demo failed:", errorMessage);
        process.exit(1);
    }
}

// Run the demo
if (require.main === module) {
    main();
} 