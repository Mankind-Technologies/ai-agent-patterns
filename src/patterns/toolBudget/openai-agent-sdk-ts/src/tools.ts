/**
 * Tool Definitions
 * 
 * Contains both expensive (web scraping) and free (local search) tools
 * for the research assistant.
 */

import { tool } from "@openai/agents";
import { z } from "zod";
import { budget } from "./budget";
import { searchKnowledgeBase } from "./knowledge-base";

const log = true;
const logger = (message: string) => log && console.log(message);

// Web Scraping Tool (Expensive)
export const webScrapeInputSchema = z.object({
    url: z.string(),
    topic: z.string(),
});

export interface WebScrapeToolOutput {
    content: string;
    success: boolean;
    source: string;
    processingTime: number;
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
        },
        "github.com": {
            content: "GitHub: Latest repository updates, trending projects, and open source developments. Recent trends include AI/ML projects, WebAssembly applications, and cloud-native tools.",
            processingTime: 1.9
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

// Budgeted web scraping tool
export function createWebScrapeTool(maxUses: number = 3) {
    return tool(budget({
        name: "webScrape",
        description: "Scrape web content for the latest information. This is an expensive operation that involves network requests, parsing, and data extraction.",
        parameters: webScrapeInputSchema,
        execute: async (input: z.infer<typeof webScrapeInputSchema>): Promise<WebScrapeToolOutput> => {
            logger(`[webScrape] Starting expensive web scraping for: ${input.topic} from ${input.url}`);
            return await simulateWebScraping(input.url, input.topic);
        },
    }, {maxTimes: maxUses}));
}

// Non-budgeted web scraping tool (for comparison)
export const webScrapeToolUnlimited = tool({
    name: "webScrape",
    description: "Scrape web content for the latest information. This is an expensive operation that involves network requests, parsing, and data extraction.",
    parameters: webScrapeInputSchema,
    execute: async (input: z.infer<typeof webScrapeInputSchema>): Promise<WebScrapeToolOutput> => {
        logger(`[webScrape-UNLIMITED] Starting expensive web scraping for: ${input.topic} from ${input.url}`);
        return await simulateWebScraping(input.url, input.topic);
    },
});

// Local Search Tool (Free)
export const localSearchInputSchema = z.object({
    query: z.string(),
    category: z.enum(["javascript", "python", "react", "ai"]).nullable(),
});

export interface LocalSearchToolOutput {
    results: string[];
    success: boolean;
    source: string;
}

export const localSearchTool = tool({
    name: "localSearch",
    description: "Search through local knowledge base for information. This is a free operation with no usage limits.",
    parameters: localSearchInputSchema,
    execute: async (input: z.infer<typeof localSearchInputSchema>): Promise<LocalSearchToolOutput> => {
        logger(`[localSearch] Searching local knowledge for: ${input.query}`);
        
        const results = searchKnowledgeBase(input.query, input.category || undefined);
        
        return {
            results,
            success: true,
            source: "local_knowledge_base"
        };
    },
});

// Tool usage tracking
export interface ToolUsageStats {
    webScrapeCount: number;
    localSearchCount: number;
    totalCost: number; // Simulated cost in dollars
    totalTime: number; // Simulated time in seconds
}

export class ToolUsageTracker {
    private stats: ToolUsageStats = {
        webScrapeCount: 0,
        localSearchCount: 0,
        totalCost: 0,
        totalTime: 0
    };

    reset() {
        this.stats = {
            webScrapeCount: 0,
            localSearchCount: 0,
            totalCost: 0,
            totalTime: 0
        };
    }

    trackWebScrape(processingTime: number = 2.0) {
        this.stats.webScrapeCount++;
        this.stats.totalCost += 0.10; // $0.10 per web scrape (simulated)
        this.stats.totalTime += processingTime;
    }

    trackLocalSearch() {
        this.stats.localSearchCount++;
        this.stats.totalTime += 0.1; // Very fast local search
    }

    getStats(): ToolUsageStats {
        return { ...this.stats };
    }

    getSummary(): string {
        return `
📊 Usage Summary:
- Web Scraping: ${this.stats.webScrapeCount} calls (💰 $${this.stats.totalCost.toFixed(2)})
- Local Search: ${this.stats.localSearchCount} calls (🆓 Free)
- Total Time: ${this.stats.totalTime.toFixed(1)}s
- Total Cost: $${this.stats.totalCost.toFixed(2)}`;
    }
}

// Global trackers for comparison
export const budgetedTracker = new ToolUsageTracker();
export const unlimitedTracker = new ToolUsageTracker();

// Enhanced tools with tracking
export function createTrackedWebScrapeTool(maxUses: number = 3, tracker: ToolUsageTracker) {
    return tool(budget({
        name: "webScrape",
        description: "Scrape web content for the latest information. This is an expensive operation that involves network requests, parsing, and data extraction.",
        parameters: webScrapeInputSchema,
        execute: async (input: z.infer<typeof webScrapeInputSchema>): Promise<WebScrapeToolOutput> => {
            logger(`[webScrape-BUDGETED] Starting expensive web scraping for: ${input.topic} from ${input.url}`);
            const result = await simulateWebScraping(input.url, input.topic);
            if (result.success) {
                tracker.trackWebScrape(result.processingTime);
            }
            return result;
        },
    }, {maxTimes: maxUses}));
}

export function createTrackedWebScrapeToolUnlimited(tracker: ToolUsageTracker) {
    return tool({
        name: "webScrape",
        description: "Scrape web content for the latest information. This is an expensive operation that involves network requests, parsing, and data extraction.",
        parameters: webScrapeInputSchema,
        execute: async (input: z.infer<typeof webScrapeInputSchema>): Promise<WebScrapeToolOutput> => {
            logger(`[webScrape-UNLIMITED] Starting expensive web scraping for: ${input.topic} from ${input.url}`);
            const result = await simulateWebScraping(input.url, input.topic);
            if (result.success) {
                tracker.trackWebScrape(result.processingTime);
            }
            return result;
        },
    });
}

export function createTrackedLocalSearchTool(tracker: ToolUsageTracker) {
    return tool({
        name: "localSearch",
        description: "Search through local knowledge base for information. This is a free operation with no usage limits.",
        parameters: localSearchInputSchema,
        execute: async (input: z.infer<typeof localSearchInputSchema>): Promise<LocalSearchToolOutput> => {
            logger(`[localSearch] Searching local knowledge for: ${input.query}`);
            
            const results = searchKnowledgeBase(input.query, input.category || undefined);
            tracker.trackLocalSearch();
            
            return {
                results,
                success: true,
                source: "local_knowledge_base"
            };
        },
    });
} 