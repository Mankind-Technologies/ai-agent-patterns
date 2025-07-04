import { FunctionTool } from "@openai/agents";

export interface CountDownTimerOptions {
    time: number; // in seconds
}

export class CountDownTimer {
    private time: number;
    private startTime: number | null = null;

    constructor(options: CountDownTimerOptions) {
        this.time = options.time;
    }

    public start(): void {
        this.startTime = Date.now();
    }

    private getTimePassedText():string {
        if (!this.startTime) {
            console.warn('CountDownTimer: start() was not called before starting the agent.');
            this.startTime = Date.now();
        }
        const timePassed = Date.now() - this.startTime;
        const timePassedSeconds = timePassed / 1000;
        if (timePassedSeconds > this.time) {
            console.warn(`CountDownTimer: you are taking too long to complete your task. You have ${(timePassedSeconds - this.time).toFixed(1)} seconds over the time goal. It is late.`);
            return `You are taking too long to complete your task. You have ${(timePassedSeconds - this.time).toFixed(1)} seconds over the time goal. It is late.`;
        }
        console.log('CountDownTimer: timePassed', timePassedSeconds);
        return `${timePassedSeconds.toFixed(1)} seconds since you started, you have ${(this.time - timePassedSeconds).toFixed(1)} seconds left.`;
    }

    public wrapTool(originalTool: any) { // don't get me started on the type safety of this, we can't import ToolOptions...
        return {
            ...originalTool,
            execute: async (input) => {
                const result = await originalTool.execute(input);
                // this result may be an object
                if (typeof result === 'object' && result !== null) {
                    return {
                        ...result,
                        timePassed: this.getTimePassedText()
                    };
                }
                // this result may be a string
                return `${result} ${this.getTimePassedText()}`;
            }
        };
    }

    public getAgentPromptDecoration():string {
        return `
# TIME LIMIT
You have a time limit to complete your task.
The time limit is ${this.time} seconds.
Each tool call is going to inform you about the time passed.
Some tool descriptions may explain the approximate time it takes to complete.
Use this information to make the best use of the time you have.
Your goal is to complete the task in the time limit.
`.trim();
    }
}