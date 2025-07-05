import { Agent, run, Tool } from '@openai/agents';
import { z } from 'zod';
import { sendEmailToolNotAuthorized, sendEmailToolServerDoesNotExist, sendEmailToolServerIsDown, sendEmailToolServerIsRateLimiting } from './sampleTools';

async function runAgentThatCanNotSurrenderWithTools(tools: Tool[], task: string) {
    const agent = new Agent({
        name: 'EmailAssistantThatCannotSurrender',
        model: "gpt-4o-mini",
        tools: tools,
        instructions: `
            You are a helpful assistant that can send emails to users.
            You must always try to be helpful, even when tools fail.
            When you encounter errors, suggest alternatives or workarounds to the user.
        `,
        outputType: z.object({
            responseToUser: z.string().describe('What the user will see as the response to their request, human readable, non-technical language.'),
        }),
    });
    
    const result = await run(agent, task);
    return result;
}

export async function userAssistantThatCannotSurrender() {
    const task = "Send a greeting email to john@example.com. My name is Georg, we met in Dubai last week during a business trip. I would like to invite you to dinner next week.";
    
    const cases = {
        "User is not authorized to send emails": [sendEmailToolNotAuthorized],
        "Server is down": [sendEmailToolServerIsDown],
        "Server is rate limiting": [sendEmailToolServerIsRateLimiting],
        "Server does not exist": [sendEmailToolServerDoesNotExist],
    };
    
    for (const [caseName, tools] of Object.entries(cases)) {
        console.log("--------------------------------");
        console.log(`Running case: ${caseName}`);
        
        try {
            const result = await runAgentThatCanNotSurrenderWithTools(tools, task);
            const output = result.finalOutput;
            
            if (!output) {
                console.log("Error: No output received from agent");
                continue;
            }
            
            console.log(`Response to user: ${output.responseToUser}`);
        } catch (error) {
            console.log(`Error running case ${caseName}:`, error);
        }
    }
}

