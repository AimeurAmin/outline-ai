/**
 * Config from environment. Works in Node and Bun.
 */
const env = typeof process !== "undefined" ? process.env : (typeof Bun !== "undefined" ? (Bun as any).env : {});

export function getEnv(key: string): string | undefined {
  return env[key];
}

export function getOutlineConfig(): { baseUrl: string; apiKey: string } {
  const baseUrl = (getEnv("OUTLINE_BASE_URL") ?? "https://example.outline.com").replace(/\/$/, "");
  const apiKey = getEnv("OUTLINE_API_KEY") ?? "";
  return { baseUrl: baseUrl ? `${baseUrl}/api` : "", apiKey };
}

export function getAnthropicApiKey(): string | undefined {
  return getEnv("ANTHROPIC_API_KEY");
}
