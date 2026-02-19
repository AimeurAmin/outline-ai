import { getOutlineConfig } from "./config";
import { generateEmbedding } from "./embeddings";
import { listDocuments } from "./outline";
import { vectorStore } from "./vector-store";
import type { OutlineListDoc } from "./types";

export type IndexDocumentsOptions = {
  outlineBaseUrl?: string;
  outlineApiKey?: string;
  vectorStorePath?: string;
  /** If true, refetch and reindex even when a non-empty store already exists. */
  force?: boolean;
};

export async function indexDocuments(options?: IndexDocumentsOptions): Promise<void> {
  const storePath = options?.vectorStorePath ?? "./vector-store.json";
  const outlineOpts = options
    ? {
        baseUrl: options.outlineBaseUrl ?? getOutlineConfig().baseUrl,
        apiKey: options.outlineApiKey ?? getOutlineConfig().apiKey,
      }
    : undefined;

  if (!options?.force) {
    const loaded = await vectorStore.load(storePath);
    if (loaded && vectorStore.size > 0) {
      return; // already indexed; caller can log
    }
  }
  // force: clear in-memory store so we don't append to old data
  if (options?.force && vectorStore.size > 0) {
    vectorStore.clear();
  }

  let allDocs: OutlineListDoc[] = [];
  let offset = 0;
  const limit = 25;
  let hasMore = true;

  while (hasMore) {
    const batch = await listDocuments({
      ...outlineOpts,
      limit,
      offset,
    });
    allDocs = allDocs.concat(batch);
    hasMore = batch.length === limit;
    offset += limit;
  }

  for (const doc of allDocs) {
    const title = doc.title ?? doc.name ?? "Untitled";
    const textToEmbed = `${title}\n\n${doc.text ?? ""}`.slice(0, 1000);
    try {
      const embedding = await generateEmbedding(textToEmbed);
      vectorStore.add({
        id: doc.id,
        embedding,
        metadata: {
          title,
          text: doc.text ?? "",
          url: doc.url ?? "",
        },
      });
    } catch (err) {
      // log and continue
      if (typeof console !== "undefined" && console.error) {
        console.error(`Error embedding ${title}:`, err);
      }
    }
  }

  await vectorStore.save(storePath);
}
