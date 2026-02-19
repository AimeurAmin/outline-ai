# outline-ai

Q&A over your [Outline](https://www.getoutline.com/) wiki using local embeddings and Claude.

Ask questions in plain English and get answers sourced directly from your Outline documents.

## Installation

```bash
npm install outline-ai
# or
bun add outline-ai
```

## Requirements

Set the following environment variables (e.g. in a `.env` file):

| Variable | Required | Description |
|----------|----------|-------------|
| `OUTLINE_BASE_URL` | No | Your Outline instance URL (default: `https://example.outline.com`) |
| `OUTLINE_API_KEY` | Yes | Outline API key — generate one in Outline → Settings → API |
| `ANTHROPIC_API_KEY` | Yes | Anthropic API key for Claude |

## CLI

Install globally:

```bash
npm install -g outline-ai
# or
bun add -g outline-ai
```

Index your Outline documents (run once, or after adding new documents):

```bash
outline-ai index-docs

# Force a full reindex
outline-ai index-docs --force
```

Ask a question:

```bash
outline-ai "How do we handle authentication?"
```

## Library

```ts
import { ask, indexDocuments } from "outline-ai";

// Index documents once (or on a schedule)
await indexDocuments({ vectorStorePath: "./store.json" });

// Ask a question
const result = await ask("What are the deployment steps?", {
  vectorStorePath: "./store.json",
});

console.log(result.answer);
// result.sources: [{ title: string, url?: string }]
result.sources.forEach(s => console.log(`- ${s.title}`));
```

### API

#### `ask(question, options?)`

| Option | Type | Description |
|--------|------|-------------|
| `vectorStorePath` | `string` | Path to the vector store file (default: `./vector-store.json`) |
| `anthropicApiKey` | `string` | Override `ANTHROPIC_API_KEY` env var |

Returns `Promise<{ answer: string, sources: { title: string, url?: string }[] }>`.

#### `indexDocuments(options?)`

| Option | Type | Description |
|--------|------|-------------|
| `vectorStorePath` | `string` | Where to save the index (default: `./vector-store.json`) |
| `outlineBaseUrl` | `string` | Override `OUTLINE_BASE_URL` env var |
| `outlineApiKey` | `string` | Override `OUTLINE_API_KEY` env var |
| `force` | `boolean` | Reindex even if a store already exists |

## License

MIT
