import { Agent, run, Tool, tool } from '@openai/agents';
import { z } from 'zod';
import { sendEmailToolNotAuthorized, sendEmailToolServerDoesNotExist, sendEmailToolServerIsDown, sendEmailToolServerIsRateLimiting } from './sampleTools';

async function runAgentThatCanNotSurrenderWithTools(tools: Tool[], task: string) {
    const agent = new Agent({
        name: 'UserAssistantThatCanSurrender',
        model: "gpt-4o-mini",
        tools: tools,
        instructions: 'You are a helpful assistant that can send emails to users',
        outputType: z.object({
            responseToUser: z.string().describe('What the user will see as the response to their request, human readable, non technical language.'),
        }),
        
    });
    const result = await run(agent, task);
    return result;
}

export async function userAssistantThatCannotSurrender() {
    const task = "Send a greeting email to john@example.com. My name is Georg, we meet at dubai past week during a business trip. I would like to invite you to a dinner next week.";
    const cases = {
        "User is not authorized to send emails": [sendEmailToolNotAuthorized],
        "Server is down": [sendEmailToolServerIsDown],
        "Server is rate limiting": [sendEmailToolServerIsRateLimiting],
        "Server does not exist": [sendEmailToolServerDoesNotExist],
    }
    
    for (const [key, value] of Object.entries(cases)) {
        console.log("--------------------------------");
        console.log(`Running case: ${key}`);
        const result = await runAgentThatCanNotSurrenderWithTools(value, task);
        const output = result.finalOutput;
        console.log(`Response to user: ${output?.responseToUser}`);
    }
    
}

