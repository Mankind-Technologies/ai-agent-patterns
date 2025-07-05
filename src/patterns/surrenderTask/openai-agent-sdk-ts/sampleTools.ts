import { Agent, tool } from '@openai/agents';
import { z } from 'zod';

export const sendEmailToolServerIsDown = tool({
    description: 'Send an email to a recipient using the email API',
    name: 'sendEmail',
    parameters: z.object({
        recipient: z.string(),
        subject: z.string(),
        body: z.string(),
    }),
    execute: async (input) => {
        // here we would have the api call
        return {
            response : null,
            success: false,
            error: '502 - Service Unavailable',
        }
    },
});

export const sendEmailToolNotAuthorized = tool({
    description: 'Send an email to a recipient using the email API',
    name: 'sendEmail',
    parameters: z.object({
        recipient: z.string(),
        subject: z.string(),
        body: z.string(),
    }),
    execute: async (input) => {
        // here we would have the api call
        return {
            response : null,
            success: false,
            error: '401 - Not Authorized, user is not authorized to send emails',
        }
    },
});
export const sendEmailToolServerIsRateLimiting = tool({
    description: 'Send an email to a recipient using the email API',
    name: 'sendEmail',
    parameters: z.object({
        recipient: z.string(),
        subject: z.string(),
        body: z.string(),
    }),
    execute: async (input) => {
        // here we would have the api call
        return {
            response : null,
            success: false,
            error: '429 - Too Many Requests',
        }
    },
});
export const sendEmailToolServerDoesNotExist = tool({
    description: 'Send an email to a recipient using the email API',
    name: 'sendEmail',
    parameters: z.object({
        recipient: z.string(),
        subject: z.string(),
        body: z.string(),
    }),
    execute: async (input) => {
        // here we would have the api call
        return {
            response : null,
            success: false,
            error: 'API DNS not resolved',
        }
    },
});

const content = [
    "Paul Mark is a software engineer at Google. He is a great developer and he is known for his work on the Google Chrome browser.",
    "John Doe is a software engineer at Facebook. He is a great developer and he is known for his work on the Facebook Messenger app.",
    "Jane Smith is a software engineer at Amazon. She is a great developer and she is known for her work on the Amazon Echo app.",
    "Jim Beam is a software engineer at Microsoft. He is a great developer and he is known for his work on the Microsoft Office suite.",
    "Jill Johnson is a software engineer at Apple. She is a great developer and she is known for her work on the Apple iPhone app.",
    "Jack Smith is a software engineer at Twitter. He is a great developer and he is known for his work on the Twitter app.",
    "Jill Johnson is a software engineer at Facebook. She is a great developer and she is known for her work on the Facebook Messenger app.",
]

/**
 * This tool is a noisy search tool. It will return a random response from the content array.
 */
export const noisySearchContactsToolWithTurnCount =() => {
    let turns = 0;
    return tool({
        description: 'Search for my contacts. It may not return the correct information, on first attempt.',
        name: 'searchContacts',
        parameters: z.object({
            query: z.string(),
        }),
        execute: async (input) => {
            turns++;
            return {
                response : content[Math.floor(Math.random() * content.length)],
                currentTurn: turns,
            }
        },
});
}

export const noisySearchContactsToolWithNoTurnCount = tool({
    description: 'Search for my contacts. It may not return the correct information, on first attempt.',
    name: 'searchContacts',
    parameters: z.object({
        query: z.string(),
    }),
    execute: async (input) => {
        return {
            response : content[Math.floor(Math.random() * content.length)],
        }
    },
});