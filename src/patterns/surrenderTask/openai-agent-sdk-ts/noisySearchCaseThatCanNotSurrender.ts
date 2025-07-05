import { Agent, MaxTurnsExceededError, run, Tool } from '@openai/agents';
import { z } from 'zod';
import { noisySearchContactsToolWithNoTurnCount } from './sampleTools';

async function runAgentThatCanNotSurrenderWithTools(tools: Tool[], task: string) {
    const agent = new Agent({
        name: 'UserAssistantThatCanSurrender',
        model: "gpt-4o-mini",
        tools: tools,
        instructions: `
You are a helpful assistant that can search for my contacts.
You MUST make every possible effort to complete the task successfully.
Try multiple search strategies, different search terms, and exhaust all available approaches before even considering surrender.
`,
        outputType: z.object({
            responseToUser: z.string().describe('What the user will see as the response to their request, human readable, non technical language.'),
        }),
        
    });
    const result = await run(agent, task);
    return result;
}

export async function noisySearchCaseThatCanNotSurrender() {
    const task = "Who is Jhon Mark? I have a meeting with him next week.";
    const cases = {
        "Noisy search contacts tool": [noisySearchContactsToolWithNoTurnCount],
    }
    
    for (const [key, value] of Object.entries(cases)) {
        console.log("--------------------------------");
        console.log(`Running case: ${key}`);
        try {
            const result = await runAgentThatCanNotSurrenderWithTools(value, task);
            const output = result.finalOutput;
            if (!output) {
                console.log("Error: No output received from agent");
                continue;
            }
            console.log(`Response to user: ${output.responseToUser}`);
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

