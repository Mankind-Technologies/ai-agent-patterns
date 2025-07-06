import { Agent, tool, run } from '@openai/agents';
import { z } from 'zod';
import { CountDownTurns } from './countDownTask';

const DEFAULT_MAX_TURNS = 5;

// Contact data for noisy search simulation
const contactsDatabase = [
    "Paul Mark is a software engineer at Google. He is known for his work on the Chrome browser and has extensive experience in web technologies.",
    "John Doe is a software engineer at Facebook. He specializes in React development and has contributed to the Facebook Messenger platform.",
    "Jane Smith is a senior software engineer at Amazon. She leads the team working on Alexa voice recognition systems.",
    "Jim Beam is a principal software engineer at Microsoft. He has been instrumental in developing core features of the Office suite.",
    "Jill Johnson is a software architect at Apple. She has worked on iPhone applications and iOS framework development.",
    "Jack Smith is a full-stack developer at Twitter. He focuses on the backend infrastructure that powers the Twitter platform.",
    "Jake Wilson is a data scientist at Netflix. He works on recommendation algorithms and content personalization systems.",
    "Jenny Brown is a DevOps engineer at Spotify. She manages the infrastructure that serves millions of music streams daily.",
];

// Noisy search tool that returns random results to simulate poor search quality
const noisySearchTool = {
    name: 'searchContacts',
    description: 'Search for contacts in your address book. Results may not be accurate on first attempt.',
    parameters: z.object({
        query: z.string().describe('Search term to find contacts'),
    }),
    execute: async (input) => {
        // Return random contact info to simulate noisy search results
        const randomContact = contactsDatabase[Math.floor(Math.random() * contactsDatabase.length)];
        
        return {
            response: randomContact,
            searchTerm: input.query,
        };
    },
};

// Create an agent with turn-aware tools
function createTurnAwareAgent(maxTurns: number) {
    const countDownTurns = new CountDownTurns({ maxTurns: maxTurns });
    
    // Wrap the noisy search tool with turn tracker
    const wrappedNoisySearch = tool(countDownTurns.wrapTool(noisySearchTool));
    
    const agent = new Agent({
        name: 'Turn-Aware Search Assistant',
        instructions: `
You are a helpful assistant that can search for contacts.

${countDownTurns.getAgentPromptDecoration()}

You have access to a searchContacts tool that may return noisy/inaccurate results.
IMPORTANT: Each tool call uses exactly 1 turn.

STRATEGIC APPROACH:
- Try multiple search strategies and variations
- Use different search terms, spellings, and approaches
- Monitor your remaining turns carefully
- When you're running low on turns, decide whether to:
  1. Continue searching with a different approach
  2. Provide the best information you've found so far
  3. Admit you couldn't find the specific person

Be strategic about your search approach based on remaining turns.
`,
        model: 'gpt-4o-mini',
        tools: [wrappedNoisySearch]
    });
    
    return { agent, countDownTurns };
}

// Create a regular agent without turn awareness
function createRegularAgent() {
    const agent = new Agent({
        name: 'Regular Search Assistant',
        instructions: `
You are a helpful assistant that can search for contacts.

You have access to a searchContacts tool that may return noisy/inaccurate results.
Try multiple search strategies and variations until you find the right person.
Use different search terms, spellings, and approaches.
Be thorough and persistent in your search.
`,
        model: 'gpt-4o-mini',
        tools: [tool(noisySearchTool)]
    });
    
    return agent;
}

// Example scenarios showing behavioral differences
async function runComparison() {
    console.log('🔄 CountDownTurns Pattern - Noisy Search Example\n');
    
    const searchTask = "Who is John Mark? I have a meeting with him next week.";
    
    // Scenario 1: Regular agent (no turn awareness)
    console.log('📋 Scenario 1: Regular Agent (no turn awareness)');
    console.log(`Task: "${searchTask}"\n`);
    
    const regularAgent = createRegularAgent();
    const regularResult = await run(regularAgent, searchTask);
    console.log('🤖 Regular Agent Result:', regularResult.finalOutput.slice(0, 100) + '...');
    console.log(`Used ${regularResult.state._currentTurn} turns`);
    console.log('\n' + '='.repeat(80) + '\n');
    
    // Scenario 2: Turn-aware agent with generous turn limit
    console.log('📋 Scenario 2: Turn-Aware Agent with generous limit (10 turns)');
    console.log(`Task: "${searchTask}"\n`);
    
    const { agent: generousAgent, countDownTurns: generousTurns } = createTurnAwareAgent(10);
    generousTurns.restart();
    const generousResult = await run(generousAgent, searchTask);
    console.log('🤖 Turn-Aware Agent (10 turns) Result:', generousResult.finalOutput.slice(0, 100) + '...');
    console.log(`Used ${generousResult.state._currentTurn} turns`);
    console.log('\n' + '='.repeat(80) + '\n');
    
    // Scenario 3: Turn-aware agent with moderate turn limit
    console.log('📋 Scenario 3: Turn-Aware Agent with moderate limit (5 turns)');
    console.log(`Task: "${searchTask}"\n`);
    
    const { agent: moderateAgent, countDownTurns: moderateTurns } = createTurnAwareAgent(5);
    moderateTurns.restart();
    const moderateResult = await run(moderateAgent, searchTask);
    console.log('🤖 Turn-Aware Agent (5 turns) Result:', moderateResult.finalOutput.slice(0, 100) + '...');
    console.log(`Used ${moderateResult.state._currentTurn} turns`);
    console.log('\n' + '='.repeat(80) + '\n');
    
    // Scenario 4: Turn-aware agent with tight turn limit
    console.log('📋 Scenario 4: Turn-Aware Agent with tight limit (3 turns)');
    console.log(`Task: "${searchTask}"\n`);
    
    const { agent: tightAgent, countDownTurns: tightTurns } = createTurnAwareAgent(3);
    tightTurns.restart();
    const tightResult = await run(tightAgent, searchTask);
    console.log('🤖 Turn-Aware Agent (3 turns) Result:', tightResult.finalOutput.slice(0, 100) + '...');
    console.log(`Used ${tightResult.state._currentTurn} turns`);
    console.log('\n' + '='.repeat(80) + '\n');
    
    // Scenario 5: Turn-aware agent with very tight turn limit
    console.log('📋 Scenario 5: Turn-Aware Agent with very tight limit (1 turn)');
    console.log(`Task: "${searchTask}"\n`);
    
    const { agent: veryTightAgent, countDownTurns: veryTightTurns } = createTurnAwareAgent(1);
    veryTightTurns.restart();
    const veryTightResult = await run(veryTightAgent, searchTask);
    console.log('🤖 Turn-Aware Agent (1 turn) Result:', veryTightResult.finalOutput.slice(0, 100) + '...');
    console.log(`Used ${veryTightResult.state._currentTurn} turns`);
    console.log('\n' + '='.repeat(80) + '\n');
}

// Example showing different search strategies
async function runStrategicExamples() {
    console.log('🔄 CountDownTurns Pattern - Strategic Search Examples\n');
    
    // Example 1: Ambiguous search with limited turns
    console.log('📋 Example 1: Ambiguous search (4 turns available)');
    console.log('Task: "Find contact info for Smith"\n');
    
    const { agent: agent1, countDownTurns: turns1 } = createTurnAwareAgent(4);
    turns1.restart();
    
    const result1 = await run(agent1, "Find contact info for Smith. I need to call them about a project.");
    console.log('🤖 Result:', result1.finalOutput.slice(0, 100) + '...');
    console.log(`Used ${result1.state._currentTurn} turns`);
    console.log('\n' + '='.repeat(80) + '\n');
    
    // Example 2: Specific search with very limited turns
    console.log('📋 Example 2: Specific search (2 turns available)');
    console.log('Task: "Find Jenny Brown\'s contact information"\n');
    
    const { agent: agent2, countDownTurns: turns2 } = createTurnAwareAgent(2);
    turns2.restart();
    
    const result2 = await run(agent2, "Find Jenny Brown's contact information. I need to reach out to her about a collaboration.");
    console.log('🤖 Result:', result2.finalOutput.slice(0, 100) + '...');
    console.log(`Used ${result2.state._currentTurn} turns`);
    console.log('\n' + '='.repeat(80) + '\n');
    
    // Example 3: Misspelled name with moderate turns
    console.log('📋 Example 3: Misspelled name (6 turns available)');
    console.log('Task: "Find contact for Jon Doe"\n');
    
    const { agent: agent3, countDownTurns: turns3 } = createTurnAwareAgent(6);
    turns3.restart();
    
    const result3 = await run(agent3, "Find contact for Jon Doe. I think that's how you spell his name, but I'm not sure.");
    console.log('🤖 Result:', result3.finalOutput.slice(0, 100) + '...');
    console.log(`Used ${result3.state._currentTurn} turns`);
    console.log('\n' + '='.repeat(80) + '\n');
}

// Interactive mode for testing
async function runInteractive() {
    console.log('🔄 CountDownTurns Pattern - Interactive Search Mode');
    console.log('The searchContacts tool returns noisy/random results to simulate poor search quality.');
    console.log('Each search uses exactly 1 turn\n');
    
    const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
    });
    
    const askForTurnLimit = () => {
        readline.question('Set turn limit (default 5): ', (turnInput) => {
            const turnLimit = parseInt(turnInput) || 5;
            console.log(`\n🔄 Turn limit set to ${turnLimit} turns`);
            console.log('What contact would you like me to search for?\n');
            
            const { agent, countDownTurns } = createTurnAwareAgent(turnLimit);
            
            const askQuestion = () => {
                readline.question('Your search request (or "quit" to exit, "reset" for new turn limit): ', async (task) => {
                    if (task.toLowerCase() === 'quit') {
                        console.log('👋 Goodbye!');
                        readline.close();
                        return;
                    }
                    
                    if (task.toLowerCase() === 'reset') {
                        console.log('\n');
                        askForTurnLimit();
                        return;
                    }
                    
                    try {
                        console.log(`\n🔄 Starting search with ${turnLimit} turns available...`);
                        countDownTurns.restart();
                        
                        const result = await run(agent, task);
                        console.log('\n🤖 Result:', result.finalOutput.slice(0, 100) + '...');
                        console.log(`Used ${result.state._currentTurn} turns`);
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
    
    askForTurnLimit();
}

// Main execution
async function main() {
    const args = process.argv.slice(2);
    
    if (args.includes('--interactive')) {
        await runInteractive();
    } else if (args.includes('--compare')) {
        await runComparison();
    } else if (args.includes('--strategic')) {
        await runStrategicExamples();
    } else {
        console.log('🔄 CountDownTurns Pattern - Noisy Search Demo\n');
        console.log('This example shows how agents change behavior based on turn limits when dealing with noisy search results.\n');
        console.log('Available modes:');
        console.log('  npm run dev                 - Run behavioral comparison');
        console.log('  npm run dev -- --strategic  - Run strategic search examples');
        console.log('  npm run dev -- --interactive - Run interactive mode');
        console.log('  npm run dev -- --compare     - Run behavioral comparison\n');
        
        await runComparison();
    }
}

// Run the example
if (require.main === module) {
    main().catch(console.error);
}

export { createTurnAwareAgent, createRegularAgent, CountDownTurns };
