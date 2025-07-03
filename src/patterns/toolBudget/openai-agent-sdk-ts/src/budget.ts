/**
 * Budget Pattern Implementation
 * 
 * This function wraps a tool to limit its usage and provide budget feedback.
 * Each instance gets its own budget counter to avoid state sharing issues.
 */

const log = true;
const logger = (message: string) => log && console.log(message);

export interface BudgetOptions {
    maxTimes: number;
    resetOnRun?: boolean; // Reset budget when starting a new agent run
}

export interface BudgetState {
    timesUsed: number;
    maxTimes: number;
    toolName: string;
}

// Global budget state registry
const budgetRegistry = new Map<string, BudgetState>();

export function budget(tool: any, options: BudgetOptions) {
    const toolId = `${tool.name}_${Date.now()}_${Math.random()}`;
    
    // Initialize budget state for this tool instance
    budgetRegistry.set(toolId, {
        timesUsed: 0,
        maxTimes: options.maxTimes,
        toolName: tool.name
    });
    
    const originalExecute = tool.execute;
    
    const execute = async (input: any, context: unknown) => {
        const state = budgetRegistry.get(toolId);
        if (!state) {
            throw new Error(`Budget state not found for tool ${toolId}`);
        }
        
        logger(`[budget] Requested tool ${state.toolName} with input ${JSON.stringify(input)}`);
        
        if (state.timesUsed >= state.maxTimes) {
            logger(`[budget] Tool ${state.toolName} has been used ${state.timesUsed} times, exceeding max ${state.maxTimes}.`);
            return { 
                budget: `This tool cannot be used anymore. It has reached its limit of ${state.maxTimes} uses. Consider using alternative tools.`,
                error: "BUDGET_EXCEEDED"
            };
        }
        
        state.timesUsed++;
        budgetRegistry.set(toolId, state);
        
        logger(`[budget] Invoking tool ${state.toolName} (usage ${state.timesUsed}/${state.maxTimes})`);
        
        const result = await originalExecute(input, context);
        logger(`[budget] Tool ${state.toolName} completed. Decorating result.`);
        
        const remainingUses = state.maxTimes - state.timesUsed;
        const budgetInfo = remainingUses > 0 
            ? `This tool can be used ${remainingUses} more times` 
            : `This tool has reached its usage limit`;
        
        if (result && typeof result === "object") {
            return { ...result, budget: budgetInfo };
        } else if (result && typeof result === "string") {
            return `${result} \n\n[BUDGET INFO] ${budgetInfo}`;
        }
        return result;
    };
    
    // Create a new tool object to avoid modifying the original
    const budgetedTool = {
        ...tool,
        execute,
        description: `${tool.description} \n\n[BUDGET CONSTRAINT] This tool can be used ${options.maxTimes} times maximum. After that, it will return a failure. Use strategically as it represents expensive operations.`
    };
    
    logger(`[budget] Tool ${tool.name} budgeted with ${options.maxTimes} uses (ID: ${toolId})`);
    return budgetedTool;
}

export function resetBudget(toolId: string) {
    const state = budgetRegistry.get(toolId);
    if (state) {
        state.timesUsed = 0;
        budgetRegistry.set(toolId, state);
        logger(`[budget] Reset budget for tool ${state.toolName}`);
    }
}

export function getBudgetState(toolId: string): BudgetState | undefined {
    return budgetRegistry.get(toolId);
}

export function clearAllBudgets() {
    budgetRegistry.clear();
    logger(`[budget] Cleared all budget states`);
} 