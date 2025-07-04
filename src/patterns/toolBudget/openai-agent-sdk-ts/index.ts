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
 * - Comparison mode to show with/without budget differences
 */

import { Agent, run } from "@openai/agents";
import { 
    createWebScrapeTool, 
    localSearchTool, 
    createTrackedWebScrapeTool,
    createTrackedWebScrapeToolUnlimited,
    createTrackedLocalSearchTool,
    budgetedTracker,
    unlimitedTracker
} from "./src/tools";
import { clearAllBudgets } from "./src/budget";
import { 
    AGENT_INSTRUCTIONS, 
    AGENT_INSTRUCTIONS_UNLIMITED,
    TEST_QUERIES, 
    COMPARISON_QUERIES,
    DEMO_CONFIG 
} from "./src/config";

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

async function runComparison() {
    console.log("🔬 COMPARISON MODE: Budgeted vs Unlimited Tool Usage");
    console.log("=".repeat(70));
    console.log("This comparison shows how the same agent behaves with and without budget constraints.");
    console.log("We'll run the same queries twice and compare tool usage patterns.");
    console.log("=".repeat(70));
    console.log();

    // Reset trackers and budgets
    budgetedTracker.reset();
    unlimitedTracker.reset();
    clearAllBudgets();

    // Create budgeted agent
    const budgetedWebScrapeTool = createTrackedWebScrapeTool(DEMO_CONFIG.maxWebScrapeUses, budgetedTracker);
    const budgetedLocalSearchTool = createTrackedLocalSearchTool(budgetedTracker);
    
    const budgetedAgent = new Agent({
        name: "BudgetedResearchAssistant",
        model: "gpt-4o-mini",
        instructions: AGENT_INSTRUCTIONS,
        tools: [budgetedWebScrapeTool, budgetedLocalSearchTool],
    });

    // Create unlimited agent
    const unlimitedWebScrapeTool = createTrackedWebScrapeToolUnlimited(unlimitedTracker);
    const unlimitedLocalSearchTool = createTrackedLocalSearchTool(unlimitedTracker);
    
    const unlimitedAgent = new Agent({
        name: "UnlimitedResearchAssistant",
        model: "gpt-4o-mini",
        instructions: AGENT_INSTRUCTIONS_UNLIMITED,
        tools: [unlimitedWebScrapeTool, unlimitedLocalSearchTool],
    });

    console.log("🚀 PHASE 1: Running with BUDGET CONSTRAINTS");
    console.log("=".repeat(50));
    
    for (let i = 0; i < COMPARISON_QUERIES.length; i++) {
        await runSingleQuery(budgetedAgent, COMPARISON_QUERIES[i], i + 1);
        
        if (i < COMPARISON_QUERIES.length - 1) {
            await new Promise(resolve => setTimeout(resolve, DEMO_CONFIG.delayBetweenQueries));
        }
    }

    console.log("\n" + "=".repeat(50));
    console.log("📊 BUDGETED AGENT RESULTS:");
    console.log(budgetedTracker.getSummary());
    console.log("=".repeat(50));

    // Delay between phases
    await new Promise(resolve => setTimeout(resolve, DEMO_CONFIG.delayBetweenModes));

    console.log("\n🔥 PHASE 2: Running WITHOUT BUDGET CONSTRAINTS");
    console.log("=".repeat(50));
    
    for (let i = 0; i < COMPARISON_QUERIES.length; i++) {
        await runSingleQuery(unlimitedAgent, COMPARISON_QUERIES[i], i + 1);
        
        if (i < COMPARISON_QUERIES.length - 1) {
            await new Promise(resolve => setTimeout(resolve, DEMO_CONFIG.delayBetweenQueries));
        }
    }

    console.log("\n" + "=".repeat(50));
    console.log("📊 UNLIMITED AGENT RESULTS:");
    console.log(unlimitedTracker.getSummary());
    console.log("=".repeat(50));

    // Final comparison
    console.log("\n🎯 FINAL COMPARISON");
    console.log("=".repeat(70));
    
    const budgetedStats = budgetedTracker.getStats();
    const unlimitedStats = unlimitedTracker.getStats();
    
    console.log("📊 Side-by-Side Comparison:");
    console.log(`
┌─────────────────────┬─────────────────┬─────────────────┬─────────────────┐
│ Metric              │ Budgeted Agent  │ Unlimited Agent │ Difference      │
├─────────────────────┼─────────────────┼─────────────────┼─────────────────┤
│ Web Scraping Calls  │ ${budgetedStats.webScrapeCount.toString().padEnd(15)} │ ${unlimitedStats.webScrapeCount.toString().padEnd(15)} │ ${(unlimitedStats.webScrapeCount - budgetedStats.webScrapeCount > 0 ? '+' : '').padEnd(0)}${(unlimitedStats.webScrapeCount - budgetedStats.webScrapeCount).toString().padEnd(15)} │
│ Local Search Calls  │ ${budgetedStats.localSearchCount.toString().padEnd(15)} │ ${unlimitedStats.localSearchCount.toString().padEnd(15)} │ ${(unlimitedStats.localSearchCount - budgetedStats.localSearchCount > 0 ? '+' : '').padEnd(0)}${(unlimitedStats.localSearchCount - budgetedStats.localSearchCount).toString().padEnd(15)} │
│ Total Cost          │ $${budgetedStats.totalCost.toFixed(2).padEnd(14)} │ $${unlimitedStats.totalCost.toFixed(2).padEnd(14)} │ $${(unlimitedStats.totalCost - budgetedStats.totalCost > 0 ? '+' : '').padEnd(0)}${(unlimitedStats.totalCost - budgetedStats.totalCost).toFixed(2).padEnd(14)} │
│ Total Time (s)      │ ${budgetedStats.totalTime.toFixed(1).padEnd(15)} │ ${unlimitedStats.totalTime.toFixed(1).padEnd(15)} │ ${(unlimitedStats.totalTime - budgetedStats.totalTime > 0 ? '+' : '').padEnd(0)}${(unlimitedStats.totalTime - budgetedStats.totalTime).toFixed(1).padEnd(15)} │
└─────────────────────┴─────────────────┴─────────────────┴─────────────────┘`);

    console.log("\n🔍 Key Insights:");
    
    if (unlimitedStats.webScrapeCount > budgetedStats.webScrapeCount) {
        console.log(`✅ Budget Pattern SUCCESS: Reduced expensive web scraping by ${unlimitedStats.webScrapeCount - budgetedStats.webScrapeCount} calls`);
    }
    
    if (unlimitedStats.totalCost > budgetedStats.totalCost) {
        const savings = unlimitedStats.totalCost - budgetedStats.totalCost;
        console.log(`💰 Cost Savings: $${savings.toFixed(2)} saved by using budget constraints`);
    }
    
    if (budgetedStats.localSearchCount >= unlimitedStats.localSearchCount) {
        console.log("🎯 Strategic Behavior: Budgeted agent used more free local search");
    }
    
    const costReduction = budgetedStats.totalCost > 0 ? 
        ((unlimitedStats.totalCost - budgetedStats.totalCost) / unlimitedStats.totalCost * 100) : 0;
    
    if (costReduction > 0) {
        console.log(`📊 Cost Reduction: ${costReduction.toFixed(1)}% reduction in operational costs`);
    }
    
    console.log("\n🎯 Budget Pattern Value:");
    console.log("1. ✅ Prevents excessive use of expensive tools");
    console.log("2. 💡 Encourages strategic tool selection");
    console.log("3. 💰 Reduces operational costs");
    console.log("4. 🎯 Maintains quality while being cost-conscious");
    console.log("5. 📊 Provides transparency about resource usage");
    
    console.log("=".repeat(70));
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
    // Check command line arguments
    const args = process.argv.slice(2);
    const interactive = args.includes('--interactive') || args.includes('-i');
    const comparison = args.includes('--compare') || args.includes('-c');

    if (interactive) {
        await runInteractiveMode();
    } else if (comparison) {
        await runComparison();
    } else {
        await runDemo();
    }
}

main().catch(console.error);