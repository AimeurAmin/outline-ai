import Anthropic from '@anthropic-ai/sdk';
import { searchOutlineDocs, type SEARCH_DOCS_LIST } from './outline';
import { z } from "zod";
import { zodOutputFormat } from '@anthropic-ai/sdk/helpers/zod';

type OutlineDocumentInfo = {
  id?: string;
  title?: string;
  name?: string;
  text?: string;
  url?: string;
};

async function getFullDocument(docId: string): Promise<OutlineDocumentInfo | undefined> {
  const response = await fetch('https://notes.aimamin.com/api/documents.info', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${Bun.env.OUTLINE_API_KEY}`
    },
    body: JSON.stringify({ id: docId })
  });
  const body = await response.json() as { data?: OutlineDocumentInfo };
  return body.data;
}

const QuerySchema = z.object({
  keywords: z.array(z.string().max(6))
});

const AnswerSchema = z.object({
  answer: z.string(),
  sources: z.array(z.object({
    title: z.string(),
    url: z.string().optional(),
  }))
});

const ask = async (userQuestion: string) => {
  const client = new Anthropic({
    apiKey: Bun.env.ANTHROPIC_API_KEY,  
  });

  const usedKeywords: string[] = [];
  let i = 0;
  let docs: SEARCH_DOCS_LIST = [];
  
  // Try up to 5 times to find relevant docs
  while (i < 5 && docs.length === 0) {
    i++;
    
    console.log(`🔍 Attempt ${i}: Generating search query...`);
    
    const queryResponse = await client.messages.create({
      max_tokens: 100,
      model: 'claude-sonnet-4-5-20250929',
      output_config: { format: zodOutputFormat(QuerySchema) },
      messages: [{ 
        role: 'user', 
        content: `Generate 1-6 search keywords for this question: "${userQuestion}"

Requirements:
- Max 30 characters per keyword
- No filler words (no "with", "and", "for", "the")
- Only relevant search terms
- Don't use these (they didn't work): ${usedKeywords.join(', ')}

Examples:
Question: "How do we handle authentication?"
Keywords: ["auth", "login", "jwt"]

Question: "What React performance issues did we find?"
Keywords: ["react performance", "optimization"]`
      }],
    });

    const result = JSON.parse((queryResponse.content[0] as any).text);
    const keywords = result.keywords;
    
    console.log(`Generated keywords:`, keywords);
    
    // Try each keyword
    for (const keyword of keywords) {
      usedKeywords.push(keyword);
      docs = await searchOutlineDocs(keyword);
      
      if (docs.length > 0) {
        console.log(`✓ Found ${docs.length} docs with "${keyword}"`);
        break;
      }
    }
  }

  if (docs.length === 0) {
    return {
      answer: "I couldn't find any relevant documents in your Outline for that question.",
      sources: []
    };
  }

  console.log(`📄 Found ${docs.length} relevant documents`);

  // Fetch full content for each document (docs are SEARCH_DOC_ITEM[] with .document.id)
  console.log('📥 Fetching full document content...');
  const fullDocsRaw = await Promise.all(
    docs.slice(0, 5).map(doc => getFullDocument(doc.document.id))
  );
  const fullDocs = fullDocsRaw.filter((d: OutlineDocumentInfo | undefined): d is OutlineDocumentInfo => d != null);

  if (fullDocs.length === 0) {
    return {
      answer: "I couldn't load the document content from Outline.",
      sources: []
    };
  }

  // Build context from docs (Outline may return title or name; text may be in .text)
  const context = fullDocs.map((doc, i) => ({
    index: i + 1,
    title: doc.title ?? doc.name ?? 'Untitled',
    text: (doc.text ?? '').slice(0, 2000),
    url: doc.url ?? ''
  }));

  // Get answer with structured output
  console.log('🤖 Asking Claude...');
  
  const answerResponse = await client.messages.create({
    max_tokens: 2048,
    model: 'claude-sonnet-4-5-20250929',
    output_config: { format: zodOutputFormat(AnswerSchema) },
    messages: [{ 
      role: 'user', 
      content: `Based on these documents from Outline, answer the question.

DOCUMENTS:
${context.map(doc => `[${doc.index}] ${doc.title}\n${doc.text}`).join('\n\n---\n\n')}

QUESTION: ${userQuestion}

Instructions:
- Answer based ONLY on the documents above
- Cite which documents you're using (e.g., "According to document [1]...")
- Be specific and factual
- If the documents don't have enough info, say so`
    }],
  });

  const answer = JSON.parse((answerResponse.content[0] as any).text);
  
  return answer;
}

export default ask;