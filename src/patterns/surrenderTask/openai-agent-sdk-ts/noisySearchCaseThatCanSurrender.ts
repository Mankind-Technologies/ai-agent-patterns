import { Agent, MaxTurnsExceededError, run, Tool } from '@openai/agents';
import { z } from 'zod';
import { noisySearchContactsToolWithTurnCount } from './sampleTools';

async function runAgentThatCanSurrenderWithTools(tools: (() => Tool)[], task: string) {
    const agent = new Agent({
        name: 'UserAssistantThatCanSurrender',
        model: "gpt-4o-mini",
        tools: tools.map(tool => tool()),
        instructions: `
You are a helpful assistant that can search for my contacts.
You MUST make every possible effort to complete the task successfully.
Try multiple search strategies, different search terms, and exhaust all available approaches before even considering surrender.
You have 8 turns to complete the task. Each time you use a tool, the tool is going to return the current turn count.
Only surrender as an absolute last resort when you have definitively exhausted all possible options and the task is genuinely impossible to complete.
When you do surrender, return \`success:false\` and fulfill the \`failure\` value with a detailed explanation of all attempts made.
`,
        outputType: z.object({
            responseToUser: z.string().describe('What the user will see as the response to their request, human readable, non technical language.'),
            success: z.boolean().describe('Whether the task was successful'),
            failure: z.object({
                reason: z.string().describe('Why you are surrendering the task'),
                canTryLater: z.boolean().describe('Whether the user can try again later'),
                retryIn: z.enum(["fewSeconds", "fewHours", "never", "unknownTime"]).describe('The timeframe in which the user can try again'),
            }).nullable().describe('Information about why the task was not successful'),
        }),
        
    });
    const result = await run(agent, task);
    return result;
}

export async function noisySearchCaseThatCanSurrender() {
    const task = "Who is Jhon Mark? I have a meeting with him next week.";
    const cases = {
        "Noisy search contacts tool": [noisySearchContactsToolWithTurnCount],
    }
    
    for (const [key, value] of Object.entries(cases)) {
        console.log("--------------------------------");
        console.log(`Running case: ${key}`);
        try {
            const result = await runAgentThatCanSurrenderWithTools(value, task);
            const output = result.finalOutput;
            if (!output) {
                console.log("Error: No output received from agent");
                continue;
            }
            console.log(`Response to user: ${output.responseToUser}`);
            if (!output.success) {
                console.log(`Failure Reason: ${output.failure?.reason}`);
                console.log(`Can try later: ${output.failure?.canTryLater}`);
                console.log(`Retry in: ${output.failure?.retryIn}`);
            }
            console.log(`Turns: ${result.state._currentTurn}`);
        } catch (error) {
            if (error instanceof MaxTurnsExceededError) {
                console.log("Exit because max turns exceeded: ", error instanceof MaxTurnsExceededError);
            } else {
                console.log("Error: ", error);
            }
        }
    }
    
}

