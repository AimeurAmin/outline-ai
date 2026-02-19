#!/usr/bin/env bun
/**
 * CLI for outline-ai.
 * Usage:
 *   outline-ai "Your question?"
 *   outline-ai index-docs
 */

import { ask } from "./ask";
import { indexDocuments } from "./index-documents";

const args = process.argv.slice(2);
const command = args[0];
const question = args.join(" ").trim();

async function main() {
  if (command === "index-docs" || command === "index") {
    const force = args.includes("--force") || args.includes("-f");
    console.log(force ? "🔄 Reindexing (--force)..." : "📥 Fetching documents from Outline...");
    await indexDocuments({ force });
    console.log("✅ Indexing complete.");
    return;
  }

  if (!question) {
    console.log(`
Usage:
  outline-ai "Your question?"
  outline-ai index-docs [--force]

  --force, -f   Reindex even when a store already exists (replaces existing index).

Environment:
  OUTLINE_BASE_URL  Optional. Default: https://notes.aimamin.com
  OUTLINE_API_KEY   Required for indexing and Outline API.
  ANTHROPIC_API_KEY Required for asking questions.
`);
    process.exit(1);
  }

  const result = await ask(question);
  console.log("\n📝 Answer:\n");
  console.log(result.answer);
  console.log("\n📚 Sources:");
  result.sources.forEach((s, i) => {
    console.log(`  ${i + 1}. ${s.title}`);
    if (s.url) console.log(`     ${s.url}`);
  });
}

main().catch((err) => {
  console.error(err.message ?? err);
  process.exit(1);
});
