import { AgentOutputType, StreamedRunResult, Agent, RunStreamEvent } from "@openai/agents";
import OpenAI from "openai";
import z from "zod";
import { zodTextFormat } from "openai/helpers/zod";

// Define a default ZodRawShape type for the tap message
type DefaultTapShape = {
    message: z.ZodString;
};

interface TapWrapperOptions<TContext, TAgent extends Agent<TContext, AgentOutputType>, TTap extends z.ZodRawShape> {
    onTap: (tap: z.infer<z.ZodObject<TTap>>) => void;
    flushOnMaxMessages?: number;
    paraphrasePrompt?: string;
    tapSchema?: z.ZodObject<TTap>;
}

interface SimpleTapWrapperOptions<TTap extends z.ZodRawShape> {
    onTap: (tap: z.infer<z.ZodObject<TTap>>) => void;
    flushOnMaxMessages?: number;
    paraphrasePrompt?: string;
    tapSchema?: z.ZodObject<TTap>;
}

const openai = new OpenAI();

const DEFAULT_PARAPHRASE_PROMPT = `
Rewrite the following logs. The output should be human readable, and should be a valid JSON object.
The logs come from an AI agent processing a user request. Therefore you have to rewrite the text,
using the same language as the logs, but in a plain language, no technical jargon.
Also use the first person (we), and the present tense (are, do, have).
`.trim();

export class TapWrapper<TContext, TAgent extends Agent<TContext, AgentOutputType>, TTap extends z.ZodRawShape = DefaultTapShape> {
    private onTap: (tap: z.infer<z.ZodObject<TTap>>) => void;
    private flushOnMaxMessages: number;
    private paraphrasePrompt: string;
    private tapSchema: z.ZodObject<TTap>;
    private log: string[] = [];

    constructor({ onTap, flushOnMaxMessages, paraphrasePrompt, tapSchema }: TapWrapperOptions<TContext, TAgent, TTap>) {
        this.onTap = onTap;
        this.flushOnMaxMessages = flushOnMaxMessages || 3;
        this.paraphrasePrompt = paraphrasePrompt || DEFAULT_PARAPHRASE_PROMPT;
        this.tapSchema = tapSchema || z.object({
            message: z.string(),
        }) as unknown as z.ZodObject<TTap>;
    }

    private async paraphraseEvents(logs: string[]): Promise<z.infer<z.ZodObject<TTap>>> {
        const content = logs.join("\n");
        const response = await openai.responses.parse({
            model: "gpt-4.1-nano-2025-04-14",
            input: [
                { role: "system", content: this.paraphrasePrompt },
                { role: "user", content }
            ],            
            text: {
                format: zodTextFormat(this.tapSchema, "tap"),
            },

        });
        return response.output_parsed as z.infer<z.ZodObject<TTap>>;
    }

    public async wrapStreamResult(streamResult: StreamedRunResult<TContext, TAgent>): Promise<StreamedRunResult<TContext, TAgent>> {
        const result = await streamResult;
        for await (const event of streamResult) {
            // forgot here the await, intentionally
            // so that the streamResult is not blocked, fire and forget
            this.pushEvent(event);
        }
        // once we are done, we flush the last batch
        // this await is optional, depending if you want
        // guarantees on the last onTap happening strictily before
        // having the result.
        // for example, in the example of index.ts, removing this await
        // may result in the log of the tap and the log of the result interleaved.
        await this.storeAndMaybeFlush("Task finished", true);
        return result;
    }



    private async pushEvent(event: RunStreamEvent) {
        // we are using here only the tools being called, not the reasoning or the handoffs, but we could add them.
        if (event.type === "run_item_stream_event") {
            const runItem = event.item;
            // this is when a tool is called. tool_call_output_item is the output of the tool call.
            if (runItem.type === "tool_call_item") {
                const toolCall = runItem.rawItem;
                // just reading function calls, but can add hosted tools, or computer calls
                if (toolCall.type === "function_call") {
                    const fnName = toolCall.name;
                    const fnArgs = toolCall.arguments; // this can be arbitrary long.
                    const logLine = `Invoked function ${fnName} with params (${JSON.stringify(fnArgs)})`;
                    this.storeAndMaybeFlush(logLine);
                }
            }
        }
    }

    private async storeAndMaybeFlush(logLine: string, forceFlush: boolean = false) {
        this.log.push(logLine);
        if (this.log.length >= this.flushOnMaxMessages || forceFlush) {
            const flushLogs = this.log;
            this.log = [];
            const tap = await this.paraphraseEvents(flushLogs);
            this.onTap(tap);
        }
    }

}