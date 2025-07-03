/**
 * Tool Budget Pattern Example - Research Assistant
 * 
 * This example demonstrates how to limit expensive operations using the budget pattern.
 * The agent has access to "web scraping" (simulated expensive operation) and 
 * free local knowledge search tools.
 * 
 * Prerequisites:
 * 1. Run: npm install openai
 * 
 * The agent learns to be strategic about when to use expensive tools vs. free alternatives.
 * This shows real value by:
 * - Preventing runaway costs from poorly prompted agents
 * - Forcing strategic thinking about tool usage
 * - Providing transparency about resource constraints
 */

import { Agent, run, tool } from "@openai/agents";
import { z } from "zod";

const log = true;
const logger = (message: string) => log && console.log(message);

// Simulate a knowledge base with some pre-existing information
const localKnowledgeBase = {
    "javascript": {
        "basics": "JavaScript is a high-level programming language. It's dynamically typed, interpreted, and supports object-oriented, functional, and procedural programming paradigms.",
        "frameworks": "Popular JavaScript frameworks include React, Vue.js, Angular, and Node.js for backend development.",
        "features": "Key features include closures, prototypes, async/await, destructuring, and arrow functions."
    },
    "python": {
        "basics": "Python is a high-level, interpreted programming language known for its simplicity and readability.",
        "frameworks": "Popular Python frameworks include Django, Flask, FastAPI for web development, and pandas, numpy for data science.",
        "features": "Key features include list comprehensions, generators, decorators, and dynamic typing."
    },
    "react": {
        "basics": "React is a JavaScript library for building user interfaces, developed by Facebook.",
        "concepts": "Core concepts include components, JSX, props, state, hooks, and virtual DOM.",
        "ecosystem": "React ecosystem includes Redux for state management, React Router for routing, and Next.js for full-stack development."
    },
    "ai": {
        "basics": "Artificial Intelligence is the simulation of human intelligence processes by machines.",
        "types": "Types include narrow AI (specialized), general AI (human-level), and artificial superintelligence.",
        "applications": "Applications include machine learning, natural language processing, computer vision, and robotics."
    }
};

function budget(tool: any, options: {maxTimes: number}) {
    let timesUsed = 0;
    const originalExecute = tool.execute;
    const execute = async (input: any, context: unknown) => {
        logger(`[budget] Requested tool ${tool.name} with input ${JSON.stringify(input)}`);
        if (timesUsed >= options.maxTimes) {
            logger(`[budget] Tool ${tool.name} has been used ${timesUsed} times, exceeding max ${options.maxTimes}.`);
            return { budget: `This tool cannot be used anymore. Consider using local search instead.` };
        }
        timesUsed++;
        logger(`[budget] Invoking tool ${tool.name} (usage ${timesUsed}/${options.maxTimes})`);
        const result = await originalExecute(input, context);
        logger(`[budget] Tool ${tool.name} completed. Decorating result.`);
        
        if (result && typeof result === "object") {
            return { ...result, budget: `This tool can be used ${options.maxTimes - timesUsed} more times` };
        } else if (result && typeof result === "string") {
            return `${result} \n\n[BUDGET INFO] This tool can be used ${options.maxTimes - timesUsed} more times`;
        }
        return result;
    }
    
    tool.execute = execute;
    tool.description = `${tool.description} \n\n[BUDGET CONSTRAINT] This tool can be used ${options.maxTimes} times maximum. After that, it will return a failure. Use strategically as it represents expensive operations.`;
    logger(`[budget] Tool ${tool.name} budgeted with ${options.maxTimes} uses.`);
    return tool;
}

const webScrapeInputSchema = z.object({
    url: z.string(),
    topic: z.string(),
});

interface WebScrapeToolOutput {
    content: string;
    success: boolean;
    source: string;
    processingTime: number;
}

const localSearchInputSchema = z.object({
    query: z.string(),
    category: z.enum(["javascript", "python", "react", "ai"]).nullable(),
});

interface LocalSearchToolOutput {
    results: string[];
    success: boolean;
    source: string;
}

async function simulateWebScraping(url: string, topic: string): Promise<WebScrapeToolOutput> {
    // Simulate processing time for expensive operation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const mockWebContent: Record<string, { content: string; processingTime: number }> = {
        "developer.mozilla.org": {
            content: "MDN Web Docs: Comprehensive JavaScript documentation including advanced topics like WebAssembly, Service Workers, and Web APIs. Latest ES2024 features include temporal API and pattern matching.",
            processingTime: 2.1
        },
        "react.dev": {
            content: "React Official Docs: Latest React 18 features including concurrent rendering, automatic batching, and Suspense improvements. New hooks like useId, useDeferredValue, and useTransition.",
            processingTime: 1.8
        },
        "python.org": {
            content: "Python.org: Python 3.12 introduces improved error messages, f-string improvements, and performance optimizations. New features include match statements and structural pattern matching.",
            processingTime: 2.3
        },
        "arxiv.org": {
            content: "ArXiv Research: Latest AI research papers covering large language models, multimodal AI, and autonomous systems. Recent breakthroughs in transformer architectures and federated learning.",
            processingTime: 2.7
        }
    };
    
    const domain = Object.keys(mockWebContent).find(key => url.includes(key));
    if (domain && mockWebContent[domain]) {
        const data = mockWebContent[domain];
        return {
            content: `${data.content} [Retrieved from ${url}]`,
            success: true,
            source: url,
            processingTime: data.processingTime
        };
    }
    
    return {
        content: `Simulated web scraping result for ${topic} from ${url}. This represents expensive network operations, parsing, and data extraction that would typically cost time and resources.`,
        success: true,
        source: url,
        processingTime: 2.0
    };
}

async function main() {
    const budgetedWebScrapeTool = tool(budget({
        name: "webScrape",
        description: "Scrape web content for the latest information. This is an expensive operation that involves network requests, parsing, and data extraction.",
        parameters: webScrapeInputSchema,
        execute: async (input: z.infer<typeof webScrapeInputSchema>): Promise<WebScrapeToolOutput> => {
            logger(`[webScrape] Starting expensive web scraping for: ${input.topic} from ${input.url}`);
            return await simulateWebScraping(input.url, input.topic);
        },
    }, {maxTimes: 3}));

    const localSearchTool = tool({
        name: "localSearch",
        description: "Search through local knowledge base for information. This is a free operation with no usage limits.",
        parameters: localSearchInputSchema,
        execute: async (input: z.infer<typeof localSearchInputSchema>): Promise<LocalSearchToolOutput> => {
            logger(`[localSearch] Searching local knowledge for: ${input.query}`);
            
            const results: string[] = [];
            const searchTerm = input.query.toLowerCase();
            
            // Search through the knowledge base
            for (const [topic, data] of Object.entries(localKnowledgeBase)) {
                if (input.category && input.category !== topic) continue;
                
                for (const [subtopic, content] of Object.entries(data)) {
                    if (searchTerm.includes(topic) || 
                        searchTerm.includes(subtopic) || 
                        content.toLowerCase().includes(searchTerm)) {
                        results.push(`${topic.toUpperCase()} - ${subtopic}: ${content}`);
                    }
                }
            }
            
            return {
                results: results.length > 0 ? results : ["No local knowledge found for this query."],
                success: true,
                source: "local_knowledge_base"
            };
        },
    });

    const agent = new Agent({
        name: "ResearchAssistant",
        model: "gpt-4o-mini",
        instructions: `You are a research assistant that helps users find information efficiently.

IMPORTANT BUDGET CONSTRAINTS:
- You have access to web scraping (EXPENSIVE, limited to 3 uses)
- You have unlimited access to local search (FREE, no limits)

Your strategy should be:
1. ALWAYS try local search first (it's free!)
2. Only use web scraping when:
   - Local search doesn't provide sufficient information
   - You need the very latest information
   - The topic requires specific external sources
3. When you do use web scraping, be strategic about URLs and topics
4. Inform users about your decision-making process regarding tool usage

DECISION FRAMEWORK:
- For basic programming concepts: Use local search
- For latest updates/releases: Consider web scraping
- For multiple related queries: Prioritize which ones really need web scraping
- Always explain why you're choosing expensive vs free tools

Your goal is to provide accurate information while being cost-conscious and strategic about resource usage.`,
        tools: [
            budgetedWebScrapeTool,
            localSearchTool,
        ],
    });

    console.log("🤖 Research Assistant with Tool Budget Pattern");
    console.log("=".repeat(50));
    console.log("This example demonstrates strategic tool usage:");
    console.log("- Web scraping: Expensive, limited to 3 uses");
    console.log("- Local search: Free, unlimited");
    console.log("=".repeat(50));
    console.log();

    const queries = [
        "Tell me about JavaScript basics and frameworks",
        "What are the latest React features and updates?",
        "I need information about Python for data science",
        "What are the newest AI research developments?",
        "Explain React hooks and their usage"
    ];

    for (let i = 0; i < queries.length; i++) {
        console.log(`\n🔍 Query ${i + 1}: ${queries[i]}`);
        console.log("-".repeat(40));
        
        const result = await run(agent, queries[i]);
        console.log(result.finalOutput);
        console.log("-".repeat(40));
    }
}

main().catch(console.error);