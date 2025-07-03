/**
 * Local Knowledge Base
 * 
 * Simulates a local database or cache with programming information.
 * This represents free, instantly accessible information.
 */

export interface KnowledgeEntry {
    [key: string]: string;
}

export interface KnowledgeBase {
    [topic: string]: KnowledgeEntry;
}

export const localKnowledgeBase: KnowledgeBase = {
    "javascript": {
        "basics": "JavaScript is a high-level programming language. It's dynamically typed, interpreted, and supports object-oriented, functional, and procedural programming paradigms.",
        "frameworks": "Popular JavaScript frameworks include React, Vue.js, Angular, and Node.js for backend development.",
        "features": "Key features include closures, prototypes, async/await, destructuring, and arrow functions.",
        "es6": "ES6 introduced let/const, arrow functions, classes, modules, template literals, and destructuring assignment.",
        "runtime": "JavaScript runs in browsers (V8, SpiderMonkey) and server-side environments like Node.js."
    },
    "python": {
        "basics": "Python is a high-level, interpreted programming language known for its simplicity and readability.",
        "frameworks": "Popular Python frameworks include Django, Flask, FastAPI for web development, and pandas, numpy for data science.",
        "features": "Key features include list comprehensions, generators, decorators, and dynamic typing.",
        "datascience": "Python is excellent for data science with libraries like pandas, numpy, matplotlib, scikit-learn, and tensorflow.",
        "syntax": "Python uses indentation for code blocks and has a clean, readable syntax philosophy."
    },
    "react": {
        "basics": "React is a JavaScript library for building user interfaces, developed by Facebook.",
        "concepts": "Core concepts include components, JSX, props, state, hooks, and virtual DOM.",
        "ecosystem": "React ecosystem includes Redux for state management, React Router for routing, and Next.js for full-stack development.",
        "hooks": "React hooks like useState, useEffect, useContext allow functional components to use state and lifecycle methods.",
        "performance": "React optimizes performance through virtual DOM, reconciliation, and features like React.memo and useMemo."
    },
    "ai": {
        "basics": "Artificial Intelligence is the simulation of human intelligence processes by machines.",
        "types": "Types include narrow AI (specialized), general AI (human-level), and artificial superintelligence.",
        "applications": "Applications include machine learning, natural language processing, computer vision, and robotics.",
        "ml": "Machine learning is a subset of AI that enables systems to learn from data without explicit programming.",
        "ethics": "AI ethics covers issues like bias, fairness, transparency, privacy, and the societal impact of AI systems."
    }
};

export function searchKnowledgeBase(query: string, category?: string): string[] {
    const results: string[] = [];
    const searchTerm = query.toLowerCase();
    
    // Search through the knowledge base
    for (const [topic, data] of Object.entries(localKnowledgeBase)) {
        if (category && category !== topic) continue;
        
        for (const [subtopic, content] of Object.entries(data)) {
            if (searchTerm.includes(topic) || 
                searchTerm.includes(subtopic) || 
                content.toLowerCase().includes(searchTerm) ||
                // Additional matching for common terms
                (searchTerm.includes("hook") && subtopic === "hooks") ||
                (searchTerm.includes("data") && subtopic === "datascience") ||
                (searchTerm.includes("framework") && subtopic === "frameworks") ||
                (searchTerm.includes("feature") && subtopic === "features")) {
                results.push(`${topic.toUpperCase()} - ${subtopic}: ${content}`);
            }
        }
    }
    
    return results.length > 0 ? results : ["No local knowledge found for this query."];
} 