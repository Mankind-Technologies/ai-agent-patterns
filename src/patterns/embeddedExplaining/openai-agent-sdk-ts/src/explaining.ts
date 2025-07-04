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
}

export function withExplanation(tool: any, options: ExplainingOptions = {}) {
    const {
        requireExplanation = true,
        explanationPrompt = "Explain why this action is justified and what goal it serves"
    } = options;
    
    const originalExecute = tool.execute;
    
    // Create a simple wrapper that handles explanation without changing parameters
    const execute = async (input: any, context: unknown) => {
        logger(`[explaining] Tool ${tool.name} called with explanation: "${input.why}"`);
        
        if (requireExplanation && (!input.why || input.why.trim().length === 0)) {
            logger(`[explaining] Tool ${tool.name} called without required explanation`);
            return {
                error: "EXPLANATION_REQUIRED",
                message: "This tool requires an explanation of why it's being used. Please provide a 'why' parameter."
            };
        }
        
        logger(`[explaining] Invoking tool ${tool.name}`);
        
        // Execute the original tool with the original parameters (excluding 'why')
        const { why, ...originalInput } = input;
        const result = await originalExecute(originalInput, context);
        
        logger(`[explaining] Tool ${tool.name} completed.`);
        
        return result;
    };
    
    // Add the why parameter to the tool
    const newParameters = tool.parameters.extend({
        why: z.string().describe(explanationPrompt)
    });
    
    // Create a new tool object with enhanced description
    const explainedTool = {
        ...tool,
        parameters: newParameters,
        execute,
        description: `${tool.description} \n\n[EXPLANATION REQUIRED] You must provide a clear explanation of why this action is justified and what goal it serves. Include a 'why' parameter with your reasoning.`
    };
    
    logger(`[explaining] Tool ${tool.name} enhanced with explanation requirements`);
    return explainedTool;
} 