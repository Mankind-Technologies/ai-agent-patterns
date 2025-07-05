import { tool } from '@openai/agents';
import { z } from 'zod';

// Email Tool Variations - Each simulates a different failure scenario

export const sendEmailToolServerIsDown = tool({
    description: 'Send an email to a recipient using the email API',
    name: 'sendEmail',
    parameters: z.object({
        recipient: z.string(),
        subject: z.string(),
        body: z.string(),
    }),
    execute: async (input) => {
        // Simulate server unavailability (temporary failure)
        return {
            response: null,
            success: false,
            error: '502 - Service Unavailable',
        };
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
        // Simulate authorization failure (permanent failure)
        return {
            response: null,
            success: false,
            error: '401 - Not Authorized, user is not authorized to send emails',
        };
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
        // Simulate rate limiting (temporary failure)
        return {
            response: null,
            success: false,
            error: '429 - Too Many Requests',
        };
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
        // Simulate DNS/network failure (semi-permanent failure)
        return {
            response: null,
            success: false,
            error: 'API DNS not resolved',
        };
    },
});

// Contact data for noisy search simulation
const contactsDatabase = [
    "Paul Mark is a software engineer at Google. He is known for his work on the Chrome browser and has extensive experience in web technologies.",
    "John Doe is a software engineer at Facebook. He specializes in React development and has contributed to the Facebook Messenger platform.",
    "Jane Smith is a senior software engineer at Amazon. She leads the team working on Alexa voice recognition systems.",
    "Jim Beam is a principal software engineer at Microsoft. He has been instrumental in developing core features of the Office suite.",
    "Jill Johnson is a software architect at Apple. She has worked on iPhone applications and iOS framework development.",
    "Jack Smith is a full-stack developer at Twitter. He focuses on the backend infrastructure that powers the Twitter platform.",
    "Jake Wilson is a data scientist at Netflix. He works on recommendation algorithms and content personalization systems.",
    "Jenny Brown is a DevOps engineer at Spotify. She manages the infrastructure that serves millions of music streams daily.",
];

/**
 * Noisy search tool that returns random results to simulate poor search quality.
 * This version includes turn counting to demonstrate resource management.
 */
export const noisySearchContactsToolWithTurnCount = () => {
    let turns = 0;
    
    return tool({
        description: 'Search for contacts in your address book. Results may not be accurate on first attempt.',
        name: 'searchContacts',
        parameters: z.object({
            query: z.string().describe('Search term to find contacts'),
        }),
        execute: async (input) => {
            turns++;
            // Return random contact info to simulate noisy search results
            const randomContact = contactsDatabase[Math.floor(Math.random() * contactsDatabase.length)];
            
            return {
                response: randomContact,
                currentTurn: turns,
                searchTerm: input.query,
            };
        },
    });
};

/**
 * Noisy search tool without turn counting for comparison.
 * This version demonstrates search behavior without resource tracking.
 */
export const noisySearchContactsToolWithNoTurnCount = tool({
    description: 'Search for contacts in your address book. Results may not be accurate on first attempt.',
    name: 'searchContacts',
    parameters: z.object({
        query: z.string().describe('Search term to find contacts'),
    }),
    execute: async (input) => {
        // Return random contact info to simulate noisy search results
        const randomContact = contactsDatabase[Math.floor(Math.random() * contactsDatabase.length)];
        
        return {
            response: randomContact,
            searchTerm: input.query,
        };
    },
});