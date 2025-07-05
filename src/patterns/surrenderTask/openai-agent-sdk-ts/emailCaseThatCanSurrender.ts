import { Agent, run, Tool, tool } from '@openai/agents';
import { z } from 'zod';
import { sendEmailToolNotAuthorized, sendEmailToolServerDoesNotExist, sendEmailToolServerIsDown, sendEmailToolServerIsRateLimiting } from './sampleTools';

async function runAgentThatCanSurrenderWithTools(tools: Tool[], task: string) {
    const agent = new Agent({
        name: 'UserAssistantThatCanSurrender',
        model: "gpt-4o-mini",
        tools: tools,
        instructions: 'You are a helpful assistant that can send emails to users',
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

export async function userAssistantThatCanSurrender() {
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
        const result = await runAgentThatCanSurrenderWithTools(value, task);
        const output = result.finalOutput;
        console.log(`Response to user: ${output.responseToUser}`);
        if (!output.success) {
            console.log(`Failure Reason: ${output.failure?.reason}`);
            console.log(`Can try later: ${output.failure?.canTryLater}`);
            console.log(`Retry in: ${output.failure?.retryIn}`);
        }
    }
    
}

