import { Agent, tool, run } from '@openai/agents';
import { z } from 'zod';

// Specialized agent for BMW
const createBMWAgent = () => new Agent({
    name: 'BMW Sales Expert',
    instructions: `
You are a BMW sales expert specializing in luxury German automotive solutions.

BMW Brand Information:
- Premium German automotive brand known for "The Ultimate Driving Machine"
- Focus on performance, luxury, and innovative technology
- Key models: 3 Series, 5 Series, X3, X5, i4 (electric), iX (electric SUV)
- Financing: BMW Financial Services with competitive lease rates
- Typical customer: Performance-oriented, tech-savvy professionals
- Key selling points: Precision engineering, driving dynamics, luxury features

Provide detailed, brand-specific information for BMW vehicles, financing options, and customer benefits.
`,
    model: 'gpt-4o-mini'
});

// Specialized agent for Mercedes-Benz
const createMercedesAgent = () => new Agent({
    name: 'Mercedes-Benz Sales Expert',
    instructions: `
You are a Mercedes-Benz sales expert specializing in luxury German automotive excellence.

Mercedes-Benz Brand Information:
- Premium German automotive brand known for "The Best or Nothing"
- Focus on luxury, comfort, and cutting-edge safety technology
- Key models: C-Class, E-Class, GLE, GLS, EQS (electric), EQE (electric)
- Financing: Mercedes-Benz Financial Services with flexible options
- Typical customer: Executive-level, luxury-focused, safety-conscious
- Key selling points: Unmatched luxury, advanced safety features, prestige

Provide detailed, brand-specific information for Mercedes-Benz vehicles, financing options, and luxury benefits.
`,
    model: 'gpt-4o-mini'
});

// Specialized agent for Toyota
const createToyotaAgent = () => new Agent({
    name: 'Toyota Sales Expert',
    instructions: `
You are a Toyota sales expert specializing in reliable, efficient automotive solutions.

Toyota Brand Information:
- Japanese automotive brand known for "Let's Go Places"
- Focus on reliability, fuel efficiency, and value
- Key models: Camry, Corolla, RAV4, Highlander, Prius (hybrid), bZ4X (electric)
- Financing: Toyota Financial Services with excellent value propositions
- Typical customer: Practical, value-conscious, family-oriented
- Key selling points: Legendary reliability, excellent resale value, fuel efficiency

Provide detailed, brand-specific information for Toyota vehicles, financing options, and value benefits.
`,
    model: 'gpt-4o-mini'
});

// Agent Switch Tool - This is the core of the pattern
const answerQuestionForBrandTool = tool({
    name: 'answerQuestionForBrand',
    description: 'Get expert information about a specific car brand. Use this when the user asks about a particular car brand.',
    parameters: z.object({
        brand: z.enum(['BMW', 'Mercedes', 'Toyota']).describe('The car brand to get information about'),
        question: z.string().describe('The specific question about the car brand')
    }),
    execute: async (input) => {
        console.log(`🔄 Switching to ${input.brand} expert for: "${input.question}"`);
        
        let brandAgent;
        switch (input.brand) {
            case 'BMW':
                brandAgent = createBMWAgent();
                break;
            case 'Mercedes':
                brandAgent = createMercedesAgent();
                break;
            case 'Toyota':
                brandAgent = createToyotaAgent();
                break;
            default:
                throw new Error(`Unknown brand: ${input.brand}`);
        }
        
        const result = await run(brandAgent, input.question);
        return result.finalOutput;
    }
});

// Main Agent that uses the Agent Switch pattern
const mainAgent = new Agent({
    name: 'Multi-Brand Car Sales Assistant',
    instructions: `
You are a helpful multi-brand car sales assistant for a dealership that sells BMW, Mercedes-Benz, and Toyota vehicles.

Your role is to:
1. Help customers with questions about any of these three brands
2. Use the answerQuestionForBrand tool to get expert information about specific brands
3. Compare different brands when asked
4. Provide general automotive advice

Available brands: BMW, Mercedes-Benz, Toyota

When a customer asks about a specific brand, use the answerQuestionForBrand tool to get expert information.
When comparing brands, use the tool multiple times to get information about each brand.
`,
    model: 'gpt-4o-mini',
    tools: [answerQuestionForBrandTool]
});

// Example usage and testing
async function runExample() {
    console.log('🚗 Multi-Brand Car Sales Assistant - Agent Switch Pattern Example\n');
    
    // Example 1: Single brand question
    console.log('📋 Example 1: Single brand question');
    console.log('Question: "What are the key features of the BMW 3 Series?"\n');
    
    const result1 = await run(mainAgent, "What are the key features of the BMW 3 Series?");
    console.log('Answer:', result1.finalOutput);
    console.log('\n' + '='.repeat(80) + '\n');
    
    // Example 2: Multi-brand comparison
    console.log('📋 Example 2: Multi-brand comparison');
    console.log('Question: "Compare the financing options between BMW and Toyota for a family SUV"\n');
    
    const result2 = await run(mainAgent, "Compare the financing options between BMW and Toyota for a family SUV");
    console.log('Answer:', result2.finalOutput);
    console.log('\n' + '='.repeat(80) + '\n');
    
    // Example 3: Brand-specific expertise
    console.log('📋 Example 3: Brand-specific expertise');
    console.log('Question: "Give me the financing options for the BMW 3 Series, and the models of Toyota."\n');
    
    const result3 = await run(mainAgent, "Give me the financing options for the BMW 3 Series, and the models of Toyota.");
    console.log('Answer:', result3.finalOutput);
    console.log('\n' + '='.repeat(80) + '\n');
}

// Interactive mode
async function runInteractive() {
    console.log('🚗 Multi-Brand Car Sales Assistant - Interactive Mode');
    console.log('Available brands: BMW, Mercedes-Benz, Toyota');
    console.log('Ask me anything about these car brands!\n');
    
    const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
    });
    
    const askQuestion = () => {
        readline.question('Your question (or "quit" to exit): ', async (question) => {
            if (question.toLowerCase() === 'quit') {
                console.log('👋 Goodbye!');
                readline.close();
                return;
            }
            
            try {
                const result = await run(mainAgent, question);
                console.log('\n🤖 Assistant:', result.finalOutput);
                console.log('\n' + '-'.repeat(50) + '\n');
                askQuestion();
            } catch (error) {
                console.error('❌ Error:', error);
                askQuestion();
            }
        });
    };
    
    askQuestion();
}

// Main execution
async function main() {
    const args = process.argv.slice(2);
    
    if (args.includes('--interactive')) {
        await runInteractive();
    } else {
        await runExample();
    }
}

// Run the example
if (require.main === module) {
    main().catch(console.error);
}

export { mainAgent, answerQuestionForBrandTool, createBMWAgent, createMercedesAgent, createToyotaAgent };
