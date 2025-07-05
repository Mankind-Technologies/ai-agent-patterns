import { Agent, MaxTurnsExceededError, run, Tool } from '@openai/agents';
import { z } from 'zod';
import { noisySearchContactsToolWithTurnCount } from './sampleTools';

async function runAgentThatCanSurrenderWithTools(tools: (() => Tool)[], task: string) {
    const agent = new Agent({
        name: 'SearchAssistantThatCanSurrender',
        model: "gpt-4o-mini",
        tools: tools.map(tool => tool()),
        instructions: `
            You are a helpful assistant that can search for contacts.
            You MUST make every possible effort to complete the task successfully.
            Try multiple search strategies, different search terms, and exhaust all available approaches.
            
            You have 8 turns to complete the task. Each tool use will return the current turn count.
            
            When you have exhausted all reasonable search strategies and approaches:
            - If you've tried variations of the name, different search terms, and alternative spellings
            - If the search results consistently return irrelevant information
            - If you're approaching the turn limit without progress
            
            Then you may surrender as a last resort. Return success:false and provide detailed 
            explanation of all attempts made.
        `,
        outputType: z.object({
            responseToUser: z.string().describe('What the user will see as the response to their request, human readable, non-technical language.'),
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
    const task = "Who is John Mark? I have a meeting with him next week.";
    
    const cases = {
        "Noisy search contacts tool": [noisySearchContactsToolWithTurnCount],
    };
    
    for (const [caseName, tools] of Object.entries(cases)) {
        console.log("--------------------------------");
        console.log(`Running case: ${caseName}`);
        
        try {
            const result = await runAgentThatCanSurrenderWithTools(tools, task);
            const output = result.finalOutput;
            
            if (!output) {
                console.log("Error: No output received from agent");
                continue;
            }
            
            console.log(`Response to user: ${output.responseToUser}`);
            if (!output.success && output.failure) {
                console.log(`Failure Reason: ${output.failure.reason}`);
                console.log(`Can try later: ${output.failure.canTryLater}`);
                console.log(`Retry in: ${output.failure.retryIn}`);
            }
            console.log(`Turns used: ${result.state._currentTurn}`);
        } catch (error) {
            if (error instanceof MaxTurnsExceededError) {
                console.log("Agent exceeded maximum turns before completing task");
            } else {
                console.log(`Error running case ${caseName}:`, error);
            }
        }
    }
}

