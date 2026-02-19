import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { getAnthropicApiKey } from "./config";
import { generateEmbedding } from "./embeddings";
import { vectorStore } from "./vector-store";
import type { AskResult } from "./types";

const AnswerSchema = z.object({
  answer: z.string(),
  sources: z.array(
    z.object({
      title: z.string(),
      url: z.string().optional(),
    })
  ),
});

export type AskOptions = {
  vectorStorePath?: string;
  anthropicApiKey?: string;
};

export async function ask(userQuestion: string, options?: AskOptions): Promise<AskResult> {
  const storePath = options?.vectorStorePath ?? "./vector-store.json";
  if (vectorStore.size === 0) {
    const loaded = await vectorStore.load(storePath);
    if (!loaded) {
      throw new Error(`Vector store not found at ${storePath}. Run indexing first (e.g. outline-ai index-docs).`);
    }
  }

  const apiKey = options?.anthropicApiKey ?? getAnthropicApiKey();
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY is not set.");
  }

  const client = new Anthropic({ apiKey });

  const questionEmbedding = await generateEmbedding(userQuestion);
  const results = vectorStore.search(questionEmbedding, 5);

  if (results.length === 0) {
    return { answer: "I couldn't find any relevant documents.", sources: [] };
  }

  const context = results.map((doc, i) => ({
    index: i + 1,
    title: doc.metadata.title,
    text: doc.metadata.text.slice(0, 2000),
    url: doc.metadata.url,
  }));

  const answerResponse = await client.messages.create({
    max_tokens: 2048,
    model: "claude-sonnet-4-5-20250929",
    output_config: { format: zodOutputFormat(AnswerSchema) },
    messages: [
      {
        role: "user",
        content: `Based on these documents from my Outline, answer the question.

DOCUMENTS:
${context.map((doc) => `[${doc.index}] ${doc.title}\n${doc.text}`).join("\n\n---\n\n")}

QUESTION: ${userQuestion}

Instructions:
- Answer based ONLY on the documents above
- Cite which documents you're using (e.g., "According to document [1]...")
- Be specific and factual`,
      },
    ],
  });

  const raw = (answerResponse.content[0] as { text?: string })?.text;
  if (!raw) throw new Error("Empty response from Claude");
  return JSON.parse(raw) as AskResult;
}
