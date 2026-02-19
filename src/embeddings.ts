// embeddings.ts
import { pipeline, env } from '@xenova/transformers';

// Disable local model cache if you want (optional)
// env.cacheDir = './.cache';

let embedder: any = null;

async function getEmbedder() {
  if (!embedder) {
    console.log('🔄 Loading embedding model (first time only)...');
    // This downloads ~90MB model on first run
    embedder = await pipeline(
      'feature-extraction',
      'Xenova/all-MiniLM-L6-v2' // Small, fast, good quality
    );
    console.log('✅ Model loaded!');
  }
  return embedder;
}

export async function generateEmbedding(text: string): Promise<number[]> {
  const extractor = await getEmbedder();
  
  // Generate embedding
  const output = await extractor(text, {
    pooling: 'mean',
    normalize: true,
  });
  
  // Convert to regular array
  return Array.from(output.data);
}

export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  const embeddings = [];
  
  for (const text of texts) {
    const embedding = await generateEmbedding(text);
    embeddings.push(embedding);
  }
  
  return embeddings;
}