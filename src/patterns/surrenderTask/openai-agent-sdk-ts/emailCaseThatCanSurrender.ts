import { Agent, run, Tool } from '@openai/agents';
import { z } from 'zod';
import { sendEmailToolNotAuthorized, sendEmailToolServerDoesNotExist, sendEmailToolServerIsDown, sendEmailToolServerIsRateLimiting } from './sampleTools';

async function runAgentThatCanSurrenderWithTools(tools: Tool[], task: string) {
    const agent = new Agent({
        name: 'EmailAssistantThatCanSurrender',
        model: "gpt-4o-mini",
        tools: tools,
        instructions: `
            You are a helpful assistant that can send emails to users.
            
            Due to tool limitations or external service issues, you are allowed to fail gracefully.
            When you encounter errors from tools, analyze them carefully:
            - For temporary issues (server down, rate limiting): suggest retry later
            - For permanent issues (unauthorized, DNS errors): indicate no retry possible
            
            When you must surrender, return success:false and provide detailed failure information.
            Always prioritize user experience with clear, non-technical explanations.
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

export async function userAssistantThatCanSurrender() {
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
        } catch (error) {
            console.log(`Error running case ${caseName}:`, error);
        }
    }
}

