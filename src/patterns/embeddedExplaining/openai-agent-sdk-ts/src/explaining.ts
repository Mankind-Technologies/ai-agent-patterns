/**
 * Explaining Pattern Implementation
 * 
 * This function wraps a tool to require explanations for each use.
 * This increases observability and may improve the quality of tool usage
 * by forcing the agent to be more deliberate about its decisions.
 */

import { z } from "zod";

const log = true;
const logger = (message: string) => log && console.log(message);

export interface ExplainingOptions {
    requireExplanation?: boolean; // Whether explanation is required (default: true)
    explanationPrompt?: string; // Custom prompt for explanation
    includeReasoningInOutput?: boolean; // Whether to include reasoning analysis in output
}

export interface ExplanationData {
    explanation: string;
    timestamp: string;
    toolName: string;
}

// Global explanation tracking
const explanationRegistry = new Map<string, ExplanationData[]>();

export function withExplanation(tool: any, options: ExplainingOptions = {}) {
    const {
        requireExplanation = true,
        explanationPrompt = "Explain why this action is justified and what goal it serves",
        includeReasoningInOutput = true
    } = options;
    
    const toolId = `${tool.name}_${Date.now()}_${Math.random()}`;
    
    // Initialize explanation tracking for this tool instance
    explanationRegistry.set(toolId, []);
    
    const originalExecute = tool.execute;
    
    // Create a simple wrapper that handles explanation without changing parameters
    const execute = async (input: any, context: unknown) => {
        const explanations = explanationRegistry.get(toolId) || [];
        
        logger(`[explaining] Tool ${tool.name} called with explanation: "${input.why}"`);
        
        if (requireExplanation && (!input.why || input.why.trim().length === 0)) {
            logger(`[explaining] Tool ${tool.name} called without required explanation`);
            return {
                error: "EXPLANATION_REQUIRED",
                message: "This tool requires an explanation of why it's being used. Please provide a 'why' parameter."
            };
        }
        
        // Create explanation data
        const explanationData: ExplanationData = {
            explanation: input.why || "No explanation provided",
            timestamp: new Date().toISOString(),
            toolName: tool.name
        };
        
        explanations.push(explanationData);
        explanationRegistry.set(toolId, explanations);
        
        logger(`[explaining] Invoking tool ${tool.name}`);
        
        // Execute the original tool with the original parameters (excluding 'why')
        const { why, ...originalInput } = input;
        const result = await originalExecute(originalInput, context);
        
        logger(`[explaining] Tool ${tool.name} completed. Adding explanation metadata.`);
        
        // Enhance the result with explanation metadata
        if (includeReasoningInOutput) {
            if (result && typeof result === "object") {
                return { 
                    ...result, 
                    explanation: explanationData.explanation,
                    _metadata: {
                        explainedAt: explanationData.timestamp,
                        toolName: tool.name
                    }
                };
            } else if (result && typeof result === "string") {
                return `${result} \n\n[EXPLANATION] ${explanationData.explanation}`;
            }
        }
        
        return result;
    };
    // finally, add the why parameter to the tool
    const newParameters = tool.parameters.extend({
        why: z.string().describe("Explain why this action is justified and what goal it serves")
    });
    // Create a new tool object with enhanced description but same parameters
    const explainedTool = {
        ...tool,
        parameters: newParameters,
        execute,
        description: `${tool.description} \n\n[EXPLANATION REQUIRED] You must provide a clear explanation of why this action is justified and what goal it serves. Include a 'why' parameter with your reasoning.`
    };
    
    logger(`[explaining] Tool ${tool.name} enhanced with explanation requirements (ID: ${toolId})`);
    return explainedTool;
}

export function getExplanationHistory(toolId: string): ExplanationData[] {
    return explanationRegistry.get(toolId) || [];
}

export function getAllExplanations(): Map<string, ExplanationData[]> {
    return new Map(explanationRegistry);
}

export function clearExplanationHistory(toolId?: string) {
    if (toolId) {
        explanationRegistry.delete(toolId);
        logger(`[explaining] Cleared explanation history for tool ${toolId}`);
    } else {
        explanationRegistry.clear();
        logger(`[explaining] Cleared all explanation histories`);
    }
}

export function generateExplanationSummary(): string {
    const allExplanations = Array.from(explanationRegistry.values()).flat();
    
    if (allExplanations.length === 0) {
        return "📝 No tool explanations recorded yet.";
    }
    
    const toolCounts = allExplanations.reduce((acc, exp) => {
        acc[exp.toolName] = (acc[exp.toolName] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);
    
    return `
📝 Explanation Summary:
- Total explained tool calls: ${allExplanations.length}
- Tools with explanations: ${Object.keys(toolCounts).join(", ")}
- Tool usage breakdown: ${Object.entries(toolCounts).map(([tool, count]) => `${tool}: ${count}`).join(", ")}
- Latest explanation: "${allExplanations[allExplanations.length - 1]?.explanation || "N/A"}"`;
} 