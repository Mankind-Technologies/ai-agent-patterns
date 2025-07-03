/**
 * Tool Budget Pattern Example - Research Assistant
 * 
 * This example demonstrates how to limit expensive operations using the budget pattern.
 * The agent has access to "web scraping" (simulated expensive operation) and 
 * free local knowledge search tools.
 * 
 * Prerequisites:
 * 1. Run: npm install
 * 2. Set OPENAI_API_KEY environment variable
 * 
 * The agent learns to be strategic about when to use expensive tools vs. free alternatives.
 * This shows real value by:
 * - Preventing runaway costs from poorly prompted agents
 * - Forcing strategic thinking about tool usage
 * - Providing transparency about resource constraints
 * 
 * Key improvements:
 * - Budget state isolation (no shared state between runs)
 * - Modular code structure
 * - Better error handling
 */

import { Agent, run } from "@openai/agents";
import { createWebScrapeTool, localSearchTool } from "./src/tools";
import { clearAllBudgets } from "./src/budget";
import { AGENT_INSTRUCTIONS, TEST_QUERIES, DEMO_CONFIG } from "./src/config";

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

async function runDemo() {
    console.log("🤖 Research Assistant with Tool Budget Pattern");
    console.log("=".repeat(60));
    console.log("This example demonstrates strategic tool usage:");
    console.log("- Web scraping: Expensive, limited to 3 uses per session");
    console.log("- Local search: Free, unlimited");
    console.log("=".repeat(60));
    console.log();

    // Clear any existing budget states to ensure clean start
    clearAllBudgets();

    // Create fresh tools for this demo session
    const webScrapeTool = createWebScrapeTool(DEMO_CONFIG.maxWebScrapeUses);
    
    const agent = new Agent({
        name: "ResearchAssistant",
        model: "gpt-4o-mini",
        instructions: AGENT_INSTRUCTIONS,
        tools: [
            webScrapeTool,
            localSearchTool,
        ],
    });

    // Run a subset of queries to demonstrate the pattern
    const queriesToRun = TEST_QUERIES.slice(0, 5);
    
    for (let i = 0; i < queriesToRun.length; i++) {
        await runSingleQuery(agent, queriesToRun[i], i + 1);
        
        // Small delay between queries for better readability
        if (i < queriesToRun.length - 1) {
            await new Promise(resolve => setTimeout(resolve, DEMO_CONFIG.delayBetweenQueries));
        }
    }

    console.log("\n🎯 Demo Complete!");
    console.log("=".repeat(60));
    console.log("Key observations:");
    console.log("1. Agent used local search first (free, fast)");
    console.log("2. Web scraping only when latest info needed");
    console.log("3. Budget tracking prevented excessive expensive calls");
    console.log("4. Graceful degradation when budget exhausted");
    console.log("=".repeat(60));
}

async function runInteractiveMode() {
    console.log("🎮 Interactive Mode - Ask your own questions!");
    console.log("Type 'quit' to exit, 'reset' to clear budget");
    console.log("-".repeat(50));

    const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
    });

    const webScrapeTool = createWebScrapeTool(DEMO_CONFIG.maxWebScrapeUses);
    const agent = new Agent({
        name: "ResearchAssistant",
        model: "gpt-4o-mini",
        instructions: AGENT_INSTRUCTIONS,
        tools: [webScrapeTool, localSearchTool],
    });

    const askQuestion = () => {
        readline.question('\n📝 Your question: ', async (question) => {
            if (question.toLowerCase() === 'quit') {
                console.log("👋 Goodbye!");
                readline.close();
                return;
            }
            
            if (question.toLowerCase() === 'reset') {
                clearAllBudgets();
                console.log("🔄 Budget reset! You have 3 web scraping uses again.");
                askQuestion();
                return;
            }

            await runSingleQuery(agent, question, 1);
            askQuestion();
        });
    };

    askQuestion();
}

async function main() {
    // Check if running in interactive mode
    const args = process.argv.slice(2);
    const interactive = args.includes('--interactive') || args.includes('-i');

    if (interactive) {
        await runInteractiveMode();
    } else {
        await runDemo();
    }
}

main().catch(console.error);