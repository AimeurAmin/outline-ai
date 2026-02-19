/**
 * Shared types for outline-ai.
 */

export type OutlineDoc = {
  id: string;
  url: string;
  urlId: string;
  name: string;
  description: string;
  sort: { field: string; direction: "asc" | "desc" };
  icon: string;
  index: string;
  color: string;
  permission: string | null;
  sharing: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  archivedAt: string | null;
};

export type OutlineDocsList = {
  pagination: {
    limit: number;
    offset: number;
    nextPath: string;
    total: number;
  };
  data: OutlineDoc[];
};

export type SearchDocItem = {
  ranking: number;
  context: string;
  document: OutlineDoc;
};

export type SearchDocsList = SearchDocItem[];

export type VectorDocument = {
  id: string;
  embedding: number[];
  metadata: {
    title: string;
    text: string;
    url: string;
  };
};

export type AskResult = {
  answer: string;
  sources: Array<{ title: string; url?: string }>;
};

export type OutlineConfig = {
  baseUrl: string;
  apiKey: string;
};

export type OutlineListDoc = {
  id: string;
  title?: string;
  name?: string;
  text?: string;
  url?: string;
};
