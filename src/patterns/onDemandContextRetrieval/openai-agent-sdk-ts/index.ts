import { Agent, tool, run } from '@openai/agents';
import { z } from 'zod';

// Mock car databases - these would be large documents in a real scenario
const CAR_DATABASES = {
  bmw: `
BMW 3 Series 2024 Complete Specifications:
- Engine: 2.0L TwinPower Turbo 4-cylinder, 255 hp, 295 lb-ft torque
- Transmission: 8-speed automatic with paddle shifters
- Fuel Economy: 26 mpg city, 36 mpg highway
- Price: Starting at $35,300 MSRP
- Interior: Premium leather seats, 10.25" touchscreen, wireless Apple CarPlay
- Safety: 5-star safety rating, collision warning, lane departure warning
- Dimensions: 185.7" L x 71.9" W x 56.8" H
- Warranty: 4 years/50,000 miles basic, 6 years/70,000 miles powertrain

BMW X5 2024 Complete Specifications:
- Engine: 3.0L TwinPower Turbo inline-6, 375 hp, 398 lb-ft torque
- Transmission: 8-speed automatic with xDrive AWD
- Fuel Economy: 21 mpg city, 26 mpg highway
- Price: Starting at $62,700 MSRP
- Interior: Executive leather seats, 12.3" touchscreen, Harman Kardon sound
- Safety: 5-star safety rating, adaptive cruise control, parking assistance
- Dimensions: 194.3" L x 78.9" W x 69.4" H
- Warranty: 4 years/50,000 miles basic, 6 years/70,000 miles powertrain

BMW i4 2024 Complete Specifications:
- Engine: Electric motor, 335 hp, 317 lb-ft torque
- Range: 270 miles EPA estimated
- Charging: DC fast charging up to 200 kW, 0-80% in 31 minutes
- Price: Starting at $56,400 MSRP
- Interior: Vegan leather seats, 14.9" curved touchscreen, premium audio
- Safety: 5-star safety rating, autonomous emergency braking
- Dimensions: 185.2" L x 71.9" W x 57.3" H
- Warranty: 4 years/50,000 miles basic, 8 years/100,000 miles battery
  `.trim(),

  mercedes: `
Mercedes-Benz C-Class 2024 Complete Specifications:
- Engine: 2.0L turbo 4-cylinder, 255 hp, 273 lb-ft torque
- Transmission: 9-speed automatic with 4MATIC AWD
- Fuel Economy: 23 mpg city, 32 mpg highway
- Price: Starting at $43,650 MSRP
- Interior: MB-Tex upholstery, 11.9" touchscreen, Mercedes-Benz User Experience
- Safety: 5-star safety rating, Pre-Safe collision system, blind spot monitoring
- Dimensions: 187.4" L x 71.3" W x 56.7" H
- Warranty: 4 years/50,000 miles basic, 4 years/50,000 miles powertrain

Mercedes-Benz GLE 2024 Complete Specifications:
- Engine: 3.0L turbo inline-6 with EQBoost, 362 hp, 369 lb-ft torque
- Transmission: 9-speed automatic with 4MATIC AWD
- Fuel Economy: 20 mpg city, 26 mpg highway
- Price: Starting at $57,700 MSRP
- Interior: Artico leather seats, dual 12.3" screens, Burmester sound system
- Safety: 5-star safety rating, adaptive cruise control, lane keeping assist
- Dimensions: 193.8" L x 78.2" W x 70.7" H
- Warranty: 4 years/50,000 miles basic, 4 years/50,000 miles powertrain

Mercedes-Benz EQS 2024 Complete Specifications:
- Engine: Electric motor, 516 hp, 630 lb-ft torque
- Range: 453 miles EPA estimated
- Charging: DC fast charging up to 200 kW, 0-80% in 31 minutes
- Price: Starting at $106,850 MSRP
- Interior: Nappa leather seats, 56" Hyperscreen, 4D surround sound
- Safety: 5-star safety rating, autonomous driving features
- Dimensions: 196.8" L x 75.8" W x 59.6" H
- Warranty: 4 years/50,000 miles basic, 8 years/100,000 miles battery
  `.trim(),

  toyota: `
Toyota Camry 2024 Complete Specifications:
- Engine: 2.5L 4-cylinder, 203 hp, 184 lb-ft torque
- Transmission: 8-speed automatic
- Fuel Economy: 28 mpg city, 39 mpg highway
- Price: Starting at $25,845 MSRP
- Interior: Fabric seats, 8" touchscreen, Toyota Safety Sense 2.0
- Safety: 5-star safety rating, pre-collision system, lane departure alert
- Dimensions: 192.7" L x 72.4" W x 56.9" H
- Warranty: 3 years/36,000 miles basic, 5 years/60,000 miles powertrain

Toyota RAV4 2024 Complete Specifications:
- Engine: 2.5L 4-cylinder, 203 hp, 184 lb-ft torque
- Transmission: 8-speed automatic with AWD available
- Fuel Economy: 27 mpg city, 35 mpg highway
- Price: Starting at $28,300 MSRP
- Interior: Fabric seats, 8" touchscreen, Toyota Safety Sense 2.0
- Safety: 5-star safety rating, adaptive cruise control, blind spot monitoring
- Dimensions: 180.5" L x 73.0" W x 67.0" H
- Warranty: 3 years/36,000 miles basic, 5 years/60,000 miles powertrain

Toyota Prius 2024 Complete Specifications:
- Engine: 2.0L hybrid, 194 hp combined, 120 lb-ft torque
- Transmission: CVT automatic
- Fuel Economy: 57 mpg city, 56 mpg highway
- Price: Starting at $27,450 MSRP
- Interior: Fabric seats, 8" touchscreen, Toyota Safety Sense 2.0
- Safety: 5-star safety rating, pre-collision system, pedestrian detection
- Dimensions: 185.0" L x 71.1" W x 57.0" H
- Warranty: 3 years/36,000 miles basic, 8 years/100,000 miles hybrid battery
  `.trim()
};

// Tool for accessing car specifications (this loads the full database)
const carSpecsTool = tool({
  name: 'car_specs',
  description: 'Access detailed car specifications for a specific brand',
  parameters: z.object({
    brand: z.enum(['bmw', 'mercedes', 'toyota']).describe('The car brand to get specifications for')
  }),
  execute: async (input) => {
    const { brand } = input;
    console.log(`🔍 Loading full ${brand.toUpperCase()} specifications database...`);
    
    // Simulate loading time for large document
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return CAR_DATABASES[brand];
  }
});

// Car specifications retrieval agent - performs single turn with full context
const carSpecsAgent = new Agent({
  name: 'car_specs_agent',
  model: 'gpt-4o-mini',
  instructions: `You are a car specifications expert. Your task is to:
1. Retrieve the requested car specifications using the car_specs tool
2. Extract ONLY the relevant information that answers the user's specific question
3. Format the response clearly and concisely
4. Do not include unnecessary details - focus on what was asked

You will be given a specific query about car specifications. Use the tool to access the database and return only the relevant information.`,
  tools: [carSpecsTool]
});

// Tool that uses the car specs agent - this is the On-Demand Context Retrieval pattern
const carSpecsRetrievalTool = tool({
  name: 'get_car_info',
  description: 'Get specific car information from detailed specifications database',
  parameters: z.object({
    brand: z.enum(['bmw', 'mercedes', 'toyota']).describe('The car brand to get information about'),
    question: z.string().describe('The specific question about the car brand or model')
  }),
  execute: async (input) => {
    const { brand, question } = input;
    console.log(`🔄 Retrieving ${brand.toUpperCase()} info for: "${question}"`);
    
    const query = `For ${brand}, ${question}`;
    const result = await run(carSpecsAgent, query);
    
    return result.finalOutput;
  }
});

// Main sales agent - works with extracted information across multiple turns
const salesAgent = new Agent({
  name: 'sales_agent',
  model: 'gpt-4o-mini',
  instructions: `You are a knowledgeable car sales assistant. You help customers find the right car based on their needs.

When you need specific car information, use the get_car_info tool. This tool will:
- Access the full car database for that brand
- Extract only the relevant information
- Return concise, focused answers

You should:
- Ask clarifying questions to understand customer needs
- Use the get_car_info tool when you need specific car details
- Make comparisons and recommendations based on the information provided
- Be helpful and conversational
- Keep track of customer preferences throughout the conversation

Available brands: BMW, Mercedes, Toyota`,
  tools: [carSpecsRetrievalTool]
});

// Example scenarios demonstrating the pattern
async function demonstratePattern() {
  console.log('🚗 Car Sales Assistant - On-Demand Context Retrieval Pattern Demo\n');
  
  // Example 1: Single specific query
  console.log('=== Example 1: Single Query ===');
  console.log('Customer: "What\'s the fuel economy of the BMW 3 Series?"');
  
  const result1 = await run(salesAgent, "What's the fuel economy of the BMW 3 Series?");
  console.log(`Assistant: ${result1.finalOutput}\n`);
  
  // Example 2: Multi-turn conversation simulation
  console.log('=== Example 2: Multi-turn Conversation ===');
  console.log('Customer: "I need a family SUV with good safety ratings"');
  
  const result2 = await run(salesAgent, "I need a family SUV with good safety ratings");
  console.log(`Assistant: ${result2.finalOutput}\n`);
  
  console.log('Customer: "What about the BMW X5 vs Mercedes GLE?"');
  
  const result3 = await run(salesAgent, "What about the BMW X5 vs Mercedes GLE?");
  console.log(`Assistant: ${result3.finalOutput}\n`);
  
  console.log('=== Pattern Benefits Demonstrated ===');
  console.log('✅ carSpecsAgent loaded full database only when needed');
  console.log('✅ salesAgent worked with extracted information across multiple turns');
  console.log('✅ No unnecessary context carried between turns');
  console.log('✅ Efficient token usage with focused responses');
}

// Interactive mode for testing
async function interactiveMode() {
  console.log('🚗 Car Sales Assistant - Interactive Mode');
  console.log('Ask me about BMW, Mercedes, or Toyota cars!');
  console.log('Type "exit" to quit.\n');
  
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  const askQuestion = () => {
    rl.question('You: ', async (input) => {
      if (input.toLowerCase() === 'exit') {
        console.log('👋 Goodbye!');
        rl.close();
        return;
      }
      
      try {
        const result = await run(salesAgent, input);
        console.log(`Assistant: ${result.finalOutput}\n`);
        askQuestion();
      } catch (error) {
        console.error('Error:', error);
        askQuestion();
      }
    });
  };
  
  askQuestion();
}

// Compare with naive approach (demonstration only)
async function compareWithNaive() {
  console.log('=== Comparison: On-Demand vs Naive Approach ===\n');
  
  // Naive approach - loads all context upfront
  const naiveAgent = new Agent({
    name: 'naive_agent',
    model: 'gpt-4o-mini',
    instructions: `You are a car sales assistant with access to the following car databases:

BMW Database:
${CAR_DATABASES.bmw}

Mercedes Database:
${CAR_DATABASES.mercedes}

Toyota Database:
${CAR_DATABASES.toyota}

Answer customer questions about cars using this information.`
  });
  
  console.log('Naive approach: Loaded ALL car databases upfront');
  console.log(`Total context tokens: ~${(CAR_DATABASES.bmw + CAR_DATABASES.mercedes + CAR_DATABASES.toyota).length / 4} tokens`);
  
  console.log('\nOn-Demand approach: Loads only relevant information when needed');
  console.log('Context tokens: Only what\'s extracted for the specific query');
  
  console.log('\nIn a 10-turn conversation asking about different brands:');
  console.log('- Naive: ~50,000+ tokens per turn (carries all databases)');
  console.log('- On-Demand: ~1,000-2,000 tokens per turn (only extracted info)');
  console.log('- Savings: ~95% token reduction! 💰');
  
  console.log('\nTesting both approaches with the same query:');
  console.log('Query: "What\'s the price of the Toyota Camry?"');
  
  console.log('\n--- Naive Approach ---');
  const naiveResult = await run(naiveAgent, "What's the price of the Toyota Camry?");
  console.log(`Response: ${naiveResult.finalOutput}`);
  
  console.log('\n--- On-Demand Approach ---');
  const onDemandResult = await run(salesAgent, "What's the price of the Toyota Camry?");
  console.log(`Response: ${onDemandResult.finalOutput}`);
  
  console.log('\n✅ Both approaches give similar quality answers!');
  console.log('💡 But the On-Demand approach is much more token-efficient.');
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--interactive')) {
    await interactiveMode();
  } else if (args.includes('--compare')) {
    await compareWithNaive();
  } else {
    await demonstratePattern();
  }
}

// Run the example
if (require.main === module) {
  main().catch(console.error);
}
