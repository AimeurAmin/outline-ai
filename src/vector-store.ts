import { readFile, writeFile } from "./io";
import type { VectorDocument } from "./types";

export type { VectorDocument } from "./types";

export class SimpleVectorStore {
  private documents: VectorDocument[] = [];

  add(doc: VectorDocument) {
    this.documents.push(doc);
  }

  addBatch(docs: VectorDocument[]) {
    this.documents.push(...docs);
  }

  search(queryEmbedding: number[], limit: number = 5): Array<VectorDocument & { score: number }> {
    if (this.documents.length === 0) {
      return [];
    }
    const results = this.documents.map((doc) => ({
      ...doc,
      score: this.cosineSimilarity(queryEmbedding, doc.embedding),
    }));
    results.sort((a, b) => b.score - a.score);
    return results.slice(0, limit);
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    const len = Math.min(a.length, b.length);
    for (let i = 0; i < len; i++) {
      const ai = a[i] ?? 0;
      const bi = b[i] ?? 0;
      dotProduct += ai * bi;
      normA += ai * ai;
      normB += bi * bi;
    }
    const denom = Math.sqrt(normA) * Math.sqrt(normB);
    return denom === 0 ? 0 : dotProduct / denom;
  }

  async save(filepath: string): Promise<void> {
    await writeFile(filepath, JSON.stringify(this.documents));
  }

  async load(filepath: string): Promise<boolean> {
    try {
      const raw = await readFile(filepath);
      const data = JSON.parse(raw) as VectorDocument[];
      this.documents = data;
      return true;
    } catch {
      return false;
    }
  }

  get size(): number {
    return this.documents.length;
  }

  /** Clear all documents (e.g. before a full reindex). */
  clear(): void {
    this.documents = [];
  }
}

export const vectorStore = new SimpleVectorStore();
