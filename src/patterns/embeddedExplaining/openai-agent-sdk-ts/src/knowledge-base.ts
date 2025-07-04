/**
 * Knowledge Base for Local Search
 * 
 * Simulates a local knowledge base with information about various topics.
 * This is used by the local search tool to demonstrate the difference
 * between local (cached) and web-based (current) information.
 */

export interface KnowledgeEntry {
    id: string;
    title: string;
    content: string;
    category: "javascript" | "python" | "react" | "ai";
    lastUpdated: string;
    relevanceScore: number;
}

const knowledgeBase: KnowledgeEntry[] = [
    // JavaScript entries
    {
        id: "js-001",
        title: "JavaScript ES2023 Features",
        content: "ES2023 introduced array methods like findLast(), findLastIndex(), and improved WeakMap functionality. These features enhance array manipulation and memory management in JavaScript applications.",
        category: "javascript",
        lastUpdated: "2023-06-15",
        relevanceScore: 0.9
    },
    {
        id: "js-002",
        title: "JavaScript Async/Await Patterns",
        content: "Modern JavaScript uses async/await for handling asynchronous operations. Common patterns include sequential processing, parallel execution with Promise.all(), and error handling with try/catch blocks.",
        category: "javascript",
        lastUpdated: "2023-04-20",
        relevanceScore: 0.8
    },
    {
        id: "js-003",
        title: "JavaScript Module Systems",
        content: "ES6 modules provide import/export syntax for organizing code. CommonJS uses require/module.exports. Modern bundlers like Webpack and Vite handle module resolution and bundling.",
        category: "javascript",
        lastUpdated: "2023-03-10",
        relevanceScore: 0.7
    },
    
    // Python entries
    {
        id: "py-001",
        title: "Python 3.11 Performance Improvements",
        content: "Python 3.11 includes significant performance improvements, better error messages, and enhanced debugging capabilities. The interpreter is up to 25% faster than previous versions.",
        category: "python",
        lastUpdated: "2023-05-10",
        relevanceScore: 0.9
    },
    {
        id: "py-002",
        title: "Python Type Hints and Annotations",
        content: "Type hints improve code clarity and enable better IDE support. Python 3.10+ includes union types with |, generic types, and improved typing module functionality.",
        category: "python",
        lastUpdated: "2023-04-05",
        relevanceScore: 0.8
    },
    {
        id: "py-003",
        title: "Python Async Programming",
        content: "Python's asyncio library enables concurrent programming. Key concepts include async functions, await expressions, event loops, and coroutines for handling I/O-bound operations.",
        category: "python",
        lastUpdated: "2023-03-15",
        relevanceScore: 0.7
    },
    
    // React entries
    {
        id: "react-001",
        title: "React 18 Concurrent Features",
        content: "React 18 introduces concurrent rendering, automatic batching, and new hooks like useId, useDeferredValue, and useTransition. These features improve performance and user experience.",
        category: "react",
        lastUpdated: "2023-05-20",
        relevanceScore: 0.9
    },
    {
        id: "react-002",
        title: "React Hooks Best Practices",
        content: "React hooks like useState, useEffect, and useContext enable functional components to manage state and side effects. Best practices include proper dependency arrays and custom hooks.",
        category: "react",
        lastUpdated: "2023-04-12",
        relevanceScore: 0.8
    },
    {
        id: "react-003",
        title: "React Server Components",
        content: "Server Components allow rendering components on the server, reducing bundle size and improving performance. They work with Next.js and enable better data fetching patterns.",
        category: "react",
        lastUpdated: "2023-03-25",
        relevanceScore: 0.7
    },
    
    // AI entries
    {
        id: "ai-001",
        title: "Large Language Models Overview",
        content: "Large Language Models (LLMs) like GPT-4 and Claude use transformer architectures to understand and generate human-like text. They're trained on vast amounts of text data.",
        category: "ai",
        lastUpdated: "2023-06-01",
        relevanceScore: 0.9
    },
    {
        id: "ai-002",
        title: "AI Agent Patterns",
        content: "AI agents use various patterns for tool usage, including budget constraints, retry logic, and explanation requirements. These patterns improve reliability and observability.",
        category: "ai",
        lastUpdated: "2023-05-15",
        relevanceScore: 0.8
    },
    {
        id: "ai-003",
        title: "Neural Network Architectures",
        content: "Common neural network architectures include feedforward networks, convolutional networks (CNNs), recurrent networks (RNNs), and transformer models. Each serves different use cases.",
        category: "ai",
        lastUpdated: "2023-04-08",
        relevanceScore: 0.7
    }
];

export function searchKnowledgeBase(query: string, category?: "javascript" | "python" | "react" | "ai"): string[] {
    const normalizedQuery = query.toLowerCase();
    
    let filteredEntries = knowledgeBase;
    
    // Filter by category if specified
    if (category) {
        filteredEntries = filteredEntries.filter(entry => entry.category === category);
    }
    
    // Search in title and content
    const matchingEntries = filteredEntries.filter(entry => 
        entry.title.toLowerCase().includes(normalizedQuery) ||
        entry.content.toLowerCase().includes(normalizedQuery)
    );
    
    // Sort by relevance score
    const sortedEntries = matchingEntries.sort((a, b) => b.relevanceScore - a.relevanceScore);
    
    // Return formatted results
    return sortedEntries.map(entry => 
        `**${entry.title}** (${entry.category}, updated: ${entry.lastUpdated}):\n${entry.content}`
    );
}

export function getKnowledgeBaseStats(): {
    totalEntries: number;
    categoriesCount: Record<string, number>;
    averageRelevanceScore: number;
    lastUpdated: string;
} {
    const categoriesCount = knowledgeBase.reduce((acc, entry) => {
        acc[entry.category] = (acc[entry.category] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);
    
    const averageRelevanceScore = knowledgeBase.reduce((sum, entry) => sum + entry.relevanceScore, 0) / knowledgeBase.length;
    
    const lastUpdated = knowledgeBase.reduce((latest, entry) => {
        return entry.lastUpdated > latest ? entry.lastUpdated : latest;
    }, knowledgeBase[0]?.lastUpdated || "");
    
    return {
        totalEntries: knowledgeBase.length,
        categoriesCount,
        averageRelevanceScore,
        lastUpdated
    };
}

export function addKnowledgeEntry(entry: Omit<KnowledgeEntry, 'id'>): KnowledgeEntry {
    const newEntry: KnowledgeEntry = {
        ...entry,
        id: `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
    
    knowledgeBase.push(newEntry);
    return newEntry;
}

export function updateKnowledgeEntry(id: string, updates: Partial<KnowledgeEntry>): KnowledgeEntry | null {
    const entryIndex = knowledgeBase.findIndex(entry => entry.id === id);
    if (entryIndex === -1) return null;
    
    const currentEntry = knowledgeBase[entryIndex];
    if (!currentEntry) return null;
    
    const updatedEntry = { ...currentEntry, ...updates };
    knowledgeBase[entryIndex] = updatedEntry;
    return updatedEntry;
}

export function getKnowledgeEntry(id: string): KnowledgeEntry | null {
    return knowledgeBase.find(entry => entry.id === id) || null;
} 