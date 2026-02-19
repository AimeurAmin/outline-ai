import { getOutlineConfig } from "./config";
import type { OutlineDocsList, OutlineListDoc, SearchDocsList } from "./types";

export type { OutlineDoc, OutlineDocsList, SearchDocItem, SearchDocsList } from "./types";

export async function getAllDocuments(options?: { baseUrl?: string; apiKey?: string }) {
  const cfg = options ? { baseUrl: options.baseUrl ?? getOutlineConfig().baseUrl, apiKey: options.apiKey ?? getOutlineConfig().apiKey } : getOutlineConfig();
  const response = await fetch(`${cfg.baseUrl}/collections.list`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${cfg.apiKey}`,
    },
    body: JSON.stringify({
      offset: 0,
      limit: 25,
      sort: "updatedAt",
      direction: "DESC",
      query: "",
    }),
  });
  const body = (await response.json()) as OutlineDocsList;
  if (!body.data || body.data.length === 0) {
    throw new Error("No documents found");
  }
  return body;
}

export async function searchOutlineDocs(
  query: string,
  options?: { baseUrl?: string; apiKey?: string; limit?: number }
): Promise<SearchDocsList> {
  const cfg = options ? { baseUrl: options.baseUrl ?? getOutlineConfig().baseUrl, apiKey: options.apiKey ?? getOutlineConfig().apiKey } : getOutlineConfig();
  const limit = options?.limit ?? 5;
  const response = await fetch(`${cfg.baseUrl}/documents.search`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${cfg.apiKey}`,
    },
    body: JSON.stringify({ query, limit }),
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Outline API failed: ${response.status} - ${errorText}`);
  }
  const body = (await response.json()) as { data: SearchDocsList };
  if (!body.data || body.data.length === 0) {
    return [];
  }
  return body.data;
}

export async function listDocuments(options?: {
  baseUrl?: string;
  apiKey?: string;
  limit?: number;
  offset?: number;
}): Promise<OutlineListDoc[]> {
  const cfg = options ? { baseUrl: options.baseUrl ?? getOutlineConfig().baseUrl, apiKey: options.apiKey ?? getOutlineConfig().apiKey } : getOutlineConfig();
  const limit = options?.limit ?? 25;
  const offset = options?.offset ?? 0;
  const response = await fetch(`${cfg.baseUrl}/documents.list`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${cfg.apiKey}`,
    },
    body: JSON.stringify({ limit, offset }),
  });
  const body = (await response.json()) as { data?: OutlineListDoc[] };
  return body.data ?? [];
}

export async function getDocumentInfo(
  docId: string,
  options?: { baseUrl?: string; apiKey?: string }
): Promise<{ id?: string; title?: string; name?: string; text?: string; url?: string } | undefined> {
  const cfg = options ? { baseUrl: options.baseUrl ?? getOutlineConfig().baseUrl, apiKey: options.apiKey ?? getOutlineConfig().apiKey } : getOutlineConfig();
  const response = await fetch(`${cfg.baseUrl}/documents.info`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${cfg.apiKey}`,
    },
    body: JSON.stringify({ id: docId }),
  });
  const body = (await response.json()) as { data?: { title?: string; name?: string; text?: string; url?: string } };
  return body.data;
}
