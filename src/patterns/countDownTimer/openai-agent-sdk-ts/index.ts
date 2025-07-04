import { Agent, tool, run } from '@openai/agents';
import { z } from 'zod';
import { CountDownTimer } from './countDownTimer';

// Mock tools with different execution times to demonstrate the pattern

// Fast tool - simulates a quick database lookup
const quickLookupTool = {
    name: 'quickLookup',
    description: 'Performs a quick lookup in the database. Takes ~1 second.',
    parameters: z.object({
        query: z.string().describe('The search query')
    }),
    execute: async (input) => {
        // Simulate 1 second delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        return `Quick lookup result for: "${input.query}"`;
    }
};

// Medium tool - simulates an API call
const apiCallTool = {
    name: 'apiCall',
    description: 'Makes an external API call. Takes ~3 seconds.',
    parameters: z.object({
        endpoint: z.string().describe('The API endpoint to call'),
        data: z.string().describe('The data to send')
    }),
    execute: async (input) => {
        // Simulate 3 seconds delay
        await new Promise(resolve => setTimeout(resolve, 3000));
        return `API call to ${input.endpoint} completed with data: "${input.data}"`;
    }
};

// Slow tool - simulates a heavy computation
const heavyComputationTool = {
    name: 'heavyComputation',
    description: 'Performs heavy computation. Takes ~5 seconds.',
    parameters: z.object({
        complexity: z.enum(['low', 'medium', 'high']).describe('The complexity level')
    }),
    execute: async (input) => {
        // Simulate 5 seconds delay
        await new Promise(resolve => setTimeout(resolve, 5000));
        return `Heavy computation (${input.complexity}) completed`;
    }
};

// Very slow tool - simulates a very time-consuming operation
const verySlowOperationTool = {
    name: 'verySlowOperation',
    description: 'Performs a very slow operation. Takes ~8 seconds.',
    parameters: z.object({
        operation: z.string().describe('The operation to perform')
    }),
    execute: async (input) => {
        // Simulate 8 seconds delay
        await new Promise(resolve => setTimeout(resolve, 8000));
        return `Very slow operation "${input.operation}" completed`;
    }
};

// Create an agent with time-aware tools
function createTimeAwareAgent(timeLimit: number) {
    const countDownTimer = new CountDownTimer({ time: timeLimit });
    
    // Wrap all tools with the timer
    const wrappedQuickLookup = tool(countDownTimer.wrapTool(quickLookupTool));
    const wrappedApiCall = tool(countDownTimer.wrapTool(apiCallTool));
    const wrappedHeavyComputation = tool(countDownTimer.wrapTool(heavyComputationTool));
    const wrappedVerySlowOperation = tool(countDownTimer.wrapTool(verySlowOperationTool));
    
    const agent = new Agent({
        name: 'Time-Aware Task Agent',
        instructions: `
You are a helpful assistant that can perform various tasks using available tools.

${countDownTimer.getAgentPromptDecoration()}

Available tools and their approximate execution times:
- quickLookup: ~1 second - for database lookups
- apiCall: ~3 seconds - for external API calls  
- heavyComputation: ~5 seconds - for complex calculations
- verySlowOperation: ~8 seconds - for very time-consuming operations

Plan your approach based on the time information provided with each tool response.
If you're running out of time, prioritize the most important tasks first.
`,
        model: 'gpt-4o-mini',
        tools: [wrappedQuickLookup, wrappedApiCall, wrappedHeavyComputation, wrappedVerySlowOperation]
    });
    
    return { agent, countDownTimer };
}

// Example scenarios
async function runExample() {
    console.log('⏰ CountDownTimer Pattern Example\n');
    
    // Example 1: Task that can be completed within time limit
    console.log('📋 Example 1: Task within time limit (10 seconds)');
    console.log('Task: "Look up user data and make a quick API call"\n');
    
    const { agent: agent1, countDownTimer: timer1 } = createTimeAwareAgent(10);
    timer1.start();
    
    const result1 = await run(agent1, "Look up user data for 'john_doe' and make an API call to 'users/update' with the data 'status: active'");
    console.log('Result:', result1.finalOutput);
    console.log('\n' + '='.repeat(80) + '\n');
    
    // Example 2: Task that will exceed time limit
    console.log('📋 Example 2: Task that exceeds time limit (8 seconds)');
    console.log('Task: "Perform heavy computation and very slow operation"\n');
    
    const { agent: agent2, countDownTimer: timer2 } = createTimeAwareAgent(8);
    timer2.start();
    
    const result2 = await run(agent2, "Perform a high complexity computation and then execute a very slow operation called 'data_migration'");
    console.log('Result:', result2.finalOutput);
    console.log('\n' + '='.repeat(80) + '\n');
    
    // Example 3: Multiple tasks with time pressure
    console.log('📋 Example 3: Multiple tasks with time pressure (15 seconds)');
    console.log('Task: "Prioritize and complete as many tasks as possible"\n');
    
    const { agent: agent3, countDownTimer: timer3 } = createTimeAwareAgent(15);
    timer3.start();
    
    const result3 = await run(agent3, "I need you to: 1) Execute a very slow operation called 'backup_creation', 2) Perform heavy computation with medium complexity, 3) Make an API call to 'projects/status' with 'completed', and 4) Look up data for 'project_alpha'. Prioritize based on the time available.");
    console.log('Result:', result3.finalOutput);
    console.log('\n' + '='.repeat(80) + '\n');
    
    // Example 4: Multiple API calls with time constraint
    console.log('📋 Example 4: Multiple API calls within time limit (12 seconds), probably will parallelise the calls');
    console.log('Task: "Make API calls to update project statuses for as many projects as possible"\n');
    
    const { agent: agent4, countDownTimer: timer4 } = createTimeAwareAgent(12);
    timer4.start();
    
    const result4 = await run(agent4, "Make API calls to 'projects/status' to update the status to 'completed' for projects 1, 2, 3, 4, 5, 6, 7, 8, 9, and 10. Continue making these calls for as many projects as possible within the time limit. Each call should include the project number in the data field like 'project_1: completed'.");
    console.log('Result:', result4.finalOutput);
    console.log('\n' + '='.repeat(80) + '\n');
    
    // Example 5: Sequential API calls with time constraint
    console.log('📋 Example 5: Sequential API calls within time limit (12 seconds)');
    console.log('Task: "Make API calls one by one to update project statuses"\n');
    
    const { agent: agent5, countDownTimer: timer5 } = createTimeAwareAgent(12);
    timer5.start();
    
    const result5 = await run(agent5, "Make API calls to 'projects/status' to update the status to 'completed' for projects 1, 2, 3, 4, 5, 6, 7, 8, 9, and 10. You MUST perform these calls one by one, sequentially, NOT in parallel. Wait for each call to complete before starting the next one. Continue making these calls for as many projects as possible within the time limit. Each call should include the project number in the data field like 'project_1: completed'.");
    console.log('Result:', result5.finalOutput);
    console.log('\n' + '='.repeat(80) + '\n');
    
}

// Interactive mode for testing
async function runInteractive() {
    console.log('⏰ CountDownTimer Pattern - Interactive Mode');
    console.log('Available tools: quickLookup (~1s), apiCall (~3s), heavyComputation (~5s), verySlowOperation (~8s)');
    
    const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
    });
    
    const askForTimeLimit = () => {
        readline.question('Set time limit in seconds (default 10): ', (timeInput) => {
            const timeLimit = parseInt(timeInput) || 10;
            console.log(`\n⏰ Time limit set to ${timeLimit} seconds`);
            console.log('What would you like me to do?\n');
            
            const { agent, countDownTimer } = createTimeAwareAgent(timeLimit);
            
            const askQuestion = () => {
                readline.question('Your task (or "quit" to exit, "reset" for new time limit): ', async (task) => {
                    if (task.toLowerCase() === 'quit') {
                        console.log('👋 Goodbye!');
                        readline.close();
                        return;
                    }
                    
                    if (task.toLowerCase() === 'reset') {
                        console.log('\n');
                        askForTimeLimit();
                        return;
                    }
                    
                    try {
                        console.log(`\n⏰ Starting timer for ${timeLimit} seconds...`);
                        countDownTimer.start();
                        
                        const result = await run(agent, task);
                        console.log('\n🤖 Result:', result.finalOutput);
                        console.log('\n' + '-'.repeat(50) + '\n');
                        askQuestion();
                    } catch (error) {
                        console.error('❌ Error:', error);
                        askQuestion();
                    }
                });
            };
            
            askQuestion();
        });
    };
    
    askForTimeLimit();
}

// Comparison mode - show difference between time-aware and regular agent
async function runComparison() {
    console.log('⏰ CountDownTimer Pattern - Comparison Mode\n');
    
    const task = "Look up 'user_data', make API call to 'sync', perform heavy computation with high complexity";
    const timeLimit = 12; // Should be tight for this task
    
    // Regular agent without time awareness
    console.log('📋 Regular Agent (no time awareness):');
    const regularAgent = new Agent({
        name: 'Regular Task Agent',
        instructions: 'You are a helpful assistant that can perform various tasks using available tools.',
        model: 'gpt-4o-mini',
        tools: [tool(quickLookupTool), tool(apiCallTool), tool(heavyComputationTool), tool(verySlowOperationTool)]
    });
    
    console.log(`Task: "${task}"`);
    const regularStart = Date.now();
    const regularResult = await run(regularAgent, task);
    const regularTime = (Date.now() - regularStart) / 1000;
    console.log(`Time taken: ${regularTime.toFixed(1)}s`);
    console.log('Result:', regularResult.finalOutput);
    console.log('\n' + '='.repeat(80) + '\n');
    
    // Time-aware agent
    console.log(`📋 Time-Aware Agent (${timeLimit}s limit):`);
    const { agent: timeAwareAgent, countDownTimer } = createTimeAwareAgent(timeLimit);
    
    console.log(`Task: "${task}"`);
    countDownTimer.start();
    const timeAwareStart = Date.now();
    const timeAwareResult = await run(timeAwareAgent, task);
    const timeAwareTime = (Date.now() - timeAwareStart) / 1000;
    console.log(`Time taken: ${timeAwareTime.toFixed(1)}s`);
    console.log('Result:', timeAwareResult.finalOutput);
    console.log('\n' + '='.repeat(80) + '\n');
}

// Main execution
async function main() {
    const args = process.argv.slice(2);
    
    if (args.includes('--interactive')) {
        await runInteractive();
    } else if (args.includes('--compare')) {
        await runComparison();
    } else {
        await runExample();
    }
}

// Run the example
if (require.main === module) {
    main().catch(console.error);
}

export { createTimeAwareAgent, CountDownTimer };
