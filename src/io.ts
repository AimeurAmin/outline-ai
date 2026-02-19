/**
 * Portable file I/O for Node and Bun.
 */
export async function readFile(path: string): Promise<string> {
  if (typeof Bun !== "undefined") {
    const f = (Bun as any).file(path);
    return await f.text();
  }
  const fs = await import("node:fs/promises");
  return await fs.readFile(path, "utf-8");
}

export async function writeFile(path: string, data: string): Promise<void> {
  if (typeof Bun !== "undefined") {
    await (Bun as any).write(path, data);
    return;
  }
  const fs = await import("node:fs/promises");
  await fs.writeFile(path, data, "utf-8");
}

export async function fileExists(path: string): Promise<boolean> {
  if (typeof Bun !== "undefined") {
    try {
      const f = (Bun as any).file(path);
      return await f.exists();
    } catch {
      return false;
    }
  }
  const fs = await import("node:fs/promises");
  try {
    await fs.access(path);
    return true;
  } catch {
    return false;
  }
}
