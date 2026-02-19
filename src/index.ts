/**
 * outline-ai – Q&A over your Outline wiki using embeddings + Claude.
 *
 * @packageDocumentation
 */

export { ask, type AskOptions } from "./ask";
export { generateEmbedding, generateEmbeddings } from "./embeddings";
export { indexDocuments, type IndexDocumentsOptions } from "./index-documents";
export {
  getAllDocuments,
  getDocumentInfo,
  listDocuments,
  searchOutlineDocs,
} from "./outline";
export type { OutlineDoc, OutlineDocsList, SearchDocItem, SearchDocsList } from "./outline";
export type { OutlineListDoc } from "./types";
export { vectorStore, SimpleVectorStore } from "./vector-store";
export type { VectorDocument, AskResult, OutlineConfig } from "./types";
export { getEnv, getOutlineConfig, getAnthropicApiKey } from "./config";
