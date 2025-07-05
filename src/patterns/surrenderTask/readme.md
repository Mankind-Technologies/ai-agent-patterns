
# AI Agent Pattern: Surrender Task

Ai Agents often try hard to fulfill their goal, sometimes beyond thir true possibilities. Obviously we develop AI Agents that should be capable of fulfilling their goal, however, sometimes, contextually, it is not possible. For example, tools sometimes depend on third party systems that are offline or that rate limit the requests; making the possibility of fulfilling the goal temporarily impossible; also sometimes search tools may return unspecific responses binding the agent in a loop of querying different keywords to look for data until it starves the turns. Other times, the specific request is impossible with reasonable efforts to satisfy, like asking a MathematicianAgent to find the 9048th (twin prime)[https://en.wikipedia.org/wiki/Twin_prime], that is possible, but impractical. Those scenarios may lead to the agent to try and try, until consuming the turn capacity or the context, and failing potentially ungracefully. Also, less dramatically, the agent may effectively reject the task, but without clear instructions on how to retry by the user, or without a structured way to notify to the management system (the software that runs and controls the agent) that the task failed.

The goal of this pattern is to allow the agent to surrender the task earlier, to avoid consuming more resources than needed, and to have a graceful stop and even with an explaining or a time window to retry. Also, to structure the output data, in a way that is useful for the management system to classify the attempt as failed and to take further actions if needed (like don't charging for the agent run, or allowing a retry, or just marking the interaction as failed in the UI).

The pattern implementation is as simple as:
1. instructing the agent that it can fail
2. provide to the agent a structured output that allows for `success: false` and some failure metadata.

```ts
const agent = new Agent({
    name: 'MainAgent',
    tools: tools,
    instructions: 'You are a helpful assistant that can send emails to users. Due to limitation of tools, or the user request bieng out of scope you are allowed to fail, in that case return `success:false` and fulfill the `failure` value.',
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
```

## Pattern interactions

This pattern works great with the countdown Timer pattern and countdown turns, so when the agent finds that he is running out of time or turns, can stop gracefully. This is most of the times key, to provide to the agent a clear deadline when it has to fail.

This pattern may incentivise the agent to stop earlier, and without making enough effort to perform the task.

## Pattern examples

1. `EmailCase`: Example where the structured output allows for richer failure management
2. `NoisySearch`: Example where the tool is returning noisy data, and the instruction reinforces to try until exhaustion. This example combines the turn count pattern