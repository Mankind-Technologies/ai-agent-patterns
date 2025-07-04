/**
 * Embedded Explaining Pattern Example
 * 
 * This example demonstrates how to use the explaining pattern to require
 * agents to provide explanations for their tool usage decisions.
 * 
 * The pattern adds a "why" parameter to tools that requires agents to explain
 * their reasoning for using each tool.
 */

import { Agent, tool, run } from "@openai/agents";
import { withExplanation } from "./src/explaining";
import { config } from "./src/config";
import { baseWebScrapeTool, baseLocalSearchTool } from "./src/tools";

// Create tools with explanation requirements
const explainedWebTool = withExplanation(baseWebScrapeTool, {
  requireExplanation: true,
  explanationPrompt: "Explain why web scraping is necessary and what specific information you're seeking"
});

const explainedLocalTool = withExplanation(baseLocalSearchTool, {
  requireExplanation: false,
  explanationPrompt: "Explain why you're using local search"
});

// Create agent with explained tools
const agent = new Agent({
  name: "ExplainingResearchAssistant",
  model: "gpt-4o-mini",
  instructions: `You are a research assistant. For every tool call, you must:
    
    1. Explain WHY you're using that specific tool
    2. What information you expect to find
    3. Why this tool is better than alternatives for this task
    4. How this fits your overall research strategy
    
    Be specific and thoughtful in your explanations.`,
  tools: [tool(explainedWebTool), tool(explainedLocalTool)]
});

// Test queries that demonstrate the explaining pattern
const testQueries = [
  "What are the latest JavaScript features?",
  "Tell me about React hooks",
  "How does Python handle async programming?",
  "What are recent AI research developments?",
  "Explain machine learning basics"
];

async function demonstrateExplainingPattern() {
  console.log("🔍 Embedded Explaining Pattern Demonstration");
  console.log("=" .repeat(50));
  console.log("This example shows how agents explain their tool usage decisions.\n");

  for (const [index, query] of testQueries.entries()) {
    console.log(`Query ${index + 1}: "${query}"`);
    console.log("-".repeat(40));
    
    try {
      const response = await run(agent, query);
      console.log("Response:", response.finalOutput);
    } catch (error) {
      console.error("Error:", error.message);
    }
    
    console.log(); // Empty line for readability
  }
}

// Advanced example: Custom explanation requirements
async function demonstrateCustomExplanations() {
  console.log("\n🎯 Custom Explanation Requirements");
  console.log("=" .repeat(50));
  
  // Tool with custom explanation prompt
  const customExplainedTool = withExplanation(baseWebScrapeTool, {
    explanationPrompt: "Explain what specific information you need and why web scraping is the best approach"
  });
  
  // Tool with optional explanations
  const optionalExplainedTool = withExplanation(baseLocalSearchTool, {
    requireExplanation: false
  });
  
  const customAgent = new Agent({
    name: "CustomExplainingAgent",
    model: "gpt-4o-mini",
    instructions: "You are a research assistant. Provide clear explanations for your tool usage decisions.",
    tools: [tool(customExplainedTool), tool(optionalExplainedTool)]
  });
  
  const customQueries = [
    "What are the latest React features?",
    "Tell me about Python basics"
  ];
  
  for (const [index, query] of customQueries.entries()) {
    console.log(`Custom Query ${index + 1}: "${query}"`);
    console.log("-".repeat(40));
    
    try {
      const response = await run(customAgent, query);
      console.log("Response:", response.finalOutput);
    } catch (error) {
      console.error("Error:", error.message);
    }
    
    console.log(); // Empty line for readability
  }
}

// Example: Tool without explanation (should fail)
async function demonstrateExplanationRequired() {
  console.log("\n⚠️  Explanation Required Demonstration");
  console.log("=" .repeat(50));
  
  // Try to call tool directly without explanation
  try {
    const result = await explainedWebTool.execute({
      url: "https://developer.mozilla.org",
      topic: "JavaScript"
      // Missing 'why' parameter
    });
    console.log("Result:", result);
  } catch (error) {
    console.log("Expected error:", error.message);
  }
  
  // Now with explanation
  try {
    const result = await explainedWebTool.execute({
      url: "https://developer.mozilla.org",
      topic: "JavaScript",
      why: "User asked for latest JavaScript features and local knowledge may be outdated"
    });
    console.log("Success with explanation:", result);
  } catch (error) {
    console.error("Unexpected error:", error.message);
  }
}

// Run all demonstrations
async function runAllDemos() {
  await demonstrateExplainingPattern();
  await demonstrateCustomExplanations();
  await demonstrateExplanationRequired();
  
  console.log("\n✅ Embedded Explaining Pattern demonstration completed!");
  console.log("Key benefits demonstrated:");
  console.log("- Agents explain their tool usage decisions");
  console.log("- Improved debugging and transparency");
  console.log("- Better understanding of agent reasoning");
  console.log("- Customizable explanation requirements");
}

// Only run if this file is executed directly
if (require.main === module) {
  runAllDemos().catch(console.error);
} 