/**
 * Tool Definitions for Embedded Explaining Pattern
 * 
 * Contains web scraping (expensive) and local search (free) tools
 * for the research assistant.
 */

import { tool } from "@openai/agents";
import { z } from "zod";
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
    logger(`[webScrape] Processing request for: ${topic} from ${url}`);
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate network delay
    
    const mockWebContent: Record<string, string> = {
        "developer.mozilla.org": "MDN Web Docs: Comprehensive JavaScript documentation including advanced topics like WebAssembly, Service Workers, and Web APIs. Latest ES2024 features include temporal API and pattern matching.",
        "react.dev": "React Official Docs: Latest React 18 features including concurrent rendering, automatic batching, and Suspense improvements. New hooks like useId, useDeferredValue, and useTransition.",
        "python.org": "Python.org: Python 3.12 introduces improved error messages, f-string improvements, and performance optimizations. New features include match statements and structural pattern matching.",
        "arxiv.org": "ArXiv Research: Latest AI research papers covering large language models, multimodal AI, and autonomous systems. Recent breakthroughs in transformer architectures and federated learning.",
        "github.com": "GitHub: Latest repository updates, trending projects, and open source developments. Recent trends include AI/ML projects, WebAssembly applications, and cloud-native tools."
    };
    
    const domain = Object.keys(mockWebContent).find(key => url.includes(key));
    const content = domain ? mockWebContent[domain] : `Simulated web scraping result for ${topic} from ${url}`;
    
    return {
        content: `${content} [Retrieved from ${url}]`,
        success: true,
        source: url,
        processingTime: 2.0
    };
}

// Base web scraping tool (bypassing TypeScript compilation issues)
export const baseWebScrapeTool = ({
    name: "webScrape",
    description: "Scrape web content for the latest information. This is an expensive operation that involves network requests, parsing, and data extraction.",
    parameters: webScrapeInputSchema,
    execute: async (input: any) => {
        return await simulateWebScraping(input.url, input.topic);
    }
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

export const baseLocalSearchTool = ({
    name: "localSearch",
    description: "Search through local knowledge base for information. This is a free operation with no usage limits.",
    parameters: localSearchInputSchema,
    execute: async (input: any) => {
        logger(`[localSearch] Searching local knowledge for: ${input.query}`);
        const results = searchKnowledgeBase(input.query, input.category || undefined);
        return {
            results,
            success: true,
            source: "local_knowledge_base"
        };
    }
}); 