import { FunctionTool } from "@openai/agents";

export interface CountDownTurnsOptions {
    maxTurns: number;
}

export class CountDownTurns {
    private maxTurns: number;
    private currentTurn: number = 0;

    constructor(options: CountDownTurnsOptions) {
        this.maxTurns = options.maxTurns;
    }

    public restart(): void {
        this.currentTurn = 0;
    }

    private setTurnsPassed(context: any): void {
        // Openai agents sdk stores the usage in the context
        // we can use the context.usage.requests
        // to know the amount of times the agent llm has been called
        // and infer the amount of turns.
        this.currentTurn = Math.max(context.usage.requests, this.currentTurn);
    }

    private getTurnsPassedText():string {
        if (this.currentTurn + 1 === this.maxTurns) {
            const text = `This is the last turn. You don't have any more turns left. You have to return the result to the user, don't call any more tools.`;
            console.info(`Injecting in the tool result: "${text}"`);
            return text;
        }
        if (this.currentTurn > this.maxTurns) {
            const text = `You are taking too long to complete your task. You have ${(this.currentTurn - this.maxTurns)} turns over the time goal. It is late.`;
            console.info(`Injecting in the tool result: "${text}"`);
            return text;
        }
        const text = `${this.currentTurn} turns since you started, you have ${(this.maxTurns - this.currentTurn)} turns left.`;
        console.log(`Injecting in the tool result: "${text}"`);
        return text;
    }

    public wrapTool(originalTool: any) { // don't get me started on the type safety of this, we can't import ToolOptions...
        return {
            ...originalTool,
            execute: async (input, context) => {
                this.setTurnsPassed(context);
                const result = await originalTool.execute(input);
                // this result may be an object
                if (typeof result === 'object' && result !== null) {
                    return {
                        ...result,
                        turnsPassed: this.getTurnsPassedText()
                    };
                }
                // this result may be a string
                return `${result}\n\n${this.getTurnsPassedText()}`;
            }
        };
    }

    public getAgentPromptDecoration():string {
        // we substract 1 because the first turn is the agent itself,
        // because it fails
        return `
# TURNS LIMIT
You have a maximum amount of turns to complete your task. Each time you call a tool (or multiple tools) you are using a turn.
The turns limit is ${this.maxTurns-1} turns.
Each tool call is going to inform you about the turns passed.
Some tool descriptions may explain the approximate turns it takes to complete.
Use this information to make the best use of the turns you have.
Your goal is to complete the task in the turns limit.
`.trim();
    }
}