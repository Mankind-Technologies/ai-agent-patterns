import { Agent, tool, run } from "@openai/agents";
import { TapWrapper } from "./tapWrapper";
import z from "zod";

// Define tool schemas
const calculatorInputSchema = z.object({
    operation: z.enum(["add", "subtract", "multiply", "divide", "power", "sqrt"]),
    a: z.number(),
    b: z.number().nullable()
});

const stringManipulationInputSchema = z.object({
    operation: z.enum(["uppercase", "lowercase", "reverse", "length", "word_count"]),
    text: z.string()
});

const randomNumberInputSchema = z.object({
    min: z.number().default(0),
    max: z.number().default(100),
    count: z.number().default(1)
});

const sortNumbersInputSchema = z.object({
    numbers: z.array(z.number())
});

function executeSortNumbers(numbers: number[]): number[] {
    return numbers.sort((a, b) => a - b);
}

// Tool implementations
function executeCalculator(operation: string, a: number, b?: number): number {
    switch (operation) {
        case "add":
            return a + (b || 0);
        case "subtract":
            return a - (b || 0);
        case "multiply":
            return a * (b || 1);
        case "divide":
            if (b === 0) throw new Error("Division by zero");
            return a / (b || 1);
        case "power":
            return Math.pow(a, b || 2);
        case "sqrt":
            if (a < 0) throw new Error("Cannot take square root of negative number");
            return Math.sqrt(a);
        default:
            throw new Error(`Unknown operation: ${operation}`);
    }
}

function executeStringManipulation(operation: string, text: string): string | number {
    switch (operation) {
        case "uppercase":
            return text.toUpperCase();
        case "lowercase":
            return text.toLowerCase();
        case "reverse":
            return text.split('').reverse().join('');
        case "length":
            return text.length;
        case "word_count":
            return text.trim().split(/\s+/).length;
        default:
            throw new Error(`Unknown operation: ${operation}`);
    }
}

function executeRandomNumber(min: number = 0, max: number = 100, count: number = 1): number[] {
    const numbers: number[] = [];
    for (let i = 0; i < count; i++) {
        numbers.push(Math.floor(Math.random() * (max - min + 1)) + min);
    }
    return numbers;
}

// Define tools using the correct SDK pattern
const calculatorTool = {
    name: "calculator",
    description: "Perform basic arithmetic operations",
    parameters: calculatorInputSchema,
    execute: async (input: z.infer<typeof calculatorInputSchema>) => {
        const result = executeCalculator(input.operation, input.a, input.b ?? undefined);
        return { result, operation: input.operation };
    }
};

const sortNumbersTool = {
    name: "sort_numbers",
    description: "Sort numbers in ascending order",
    parameters: sortNumbersInputSchema,
    execute: async (input: z.infer<typeof sortNumbersInputSchema>) => {
        const result = executeSortNumbers(input.numbers);
        return { numbers: result };
    }
};
const stringManipulationTool = {
    name: "string_manipulation",
    description: "Manipulate strings in various ways",
    parameters: stringManipulationInputSchema,
    execute: async (input: z.infer<typeof stringManipulationInputSchema>) => {
        const result = executeStringManipulation(input.operation, input.text);
        return { result, operation: input.operation, originalText: input.text };
    }
};

const randomNumberTool = {
    name: "random_number",
    description: "Generate random numbers",
    parameters: randomNumberInputSchema,
    execute: async (input: z.infer<typeof randomNumberInputSchema>) => {
        const result = executeRandomNumber(input.min, input.max, input.count);
        return { numbers: result, min: input.min, max: input.max, count: input.count };
    }
};

// Define custom tap schema
const CustomTapSchema = z.object({
    message: z.string(),
    toolsUsed: z.array(z.string()).nullable(),
    summary: z.string().nullable()
});

async function main() {
    console.log("🚀 Starting Tap Action Pattern Example");
    console.log("=====================================");

    // Create the agent with tools
    const agent = new Agent({
        name: "TapActionDemoAgent",
        model: "gpt-4.1-mini",
        instructions: `You are a helpful assistant with access to calculator, string manipulation, and random number generation tools. 
        When users ask for calculations, use the calculator tool. 
        When they ask about text manipulation, use the string_manipulation tool.
        When they need random numbers, use the random_number tool.
        Be friendly and explain what you're doing step by step.`,
        tools: [
            tool(calculatorTool),
            tool(stringManipulationTool),
            tool(randomNumberTool),
            tool(sortNumbersTool)
        ]
    });

    // Test queries
    const testQueries = [
        "Calculate 25 + 17 and then multiply the result by 3, then add 100 and then divide by 2",
        "Convert 'Hello World' to uppercase and tell me its length take the length and multiply by 2",
        "Generate 5 random numbers between 1 and 50, sort them from lowest to highest, then perform x1-x2+x3-x4+x5 where x1 is the lowest number, x2 is the second lowest, etc.",
        "What's the square root of 144, and then reverse the text 'mathematics'?"
    ];

    for (const query of testQueries) {
        console.log(`\n💬 User Query: "${query}"`);
        console.log("─".repeat(50));
        
        try {

            // Create and configure the tap wrapper
            const tapWrapper = new TapWrapper({
                onTap: (tap) => {
                    console.log("📡 TAP EVENT:", tap.message);
                },
                flushOnMaxMessages: 2,
                tapSchema: CustomTapSchema
            });

            // Run the agent
            const streamResult = await run(agent, query, { stream: true });
            
            // Wrap the stream result
            const wrappedResult = await tapWrapper.wrapStreamResult(streamResult as any);
            
            // Process the final result
            console.log("🤖 Agent Response:", wrappedResult.finalOutput);
            
        } catch (error) {
            console.error("❌ Error:", error.message);
        }
        
        console.log("=".repeat(70));
    }
}

// Run the example
main().catch(console.error);