import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const MEMORY_DIR = "/data/.openclaw/workspace/memory";

function sanitizeFilename(name: string): string | null {
  // Only allow alphanumeric, dash, underscore, dot
  if (!/^[\w\-\.]+$/.test(name)) return null;
  // Prevent path traversal
  if (name.includes("..")) return null;
  return name;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const file = searchParams.get("file");

  if (file) {
    const safe = sanitizeFilename(file);
    if (!safe) {
      return NextResponse.json({ error: "Invalid filename" }, { status: 400 });
    }
    const filePath = path.join(MEMORY_DIR, safe);
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }
    const content = fs.readFileSync(filePath, "utf-8");
    return NextResponse.json({ file: safe, content });
  }

  // List files
  if (!fs.existsSync(MEMORY_DIR)) {
    return NextResponse.json({ files: [] });
  }

  const files = fs.readdirSync(MEMORY_DIR)
    .filter((f) => f.endsWith(".md") || f.endsWith(".txt") || f.endsWith(".json"))
    .sort()
    .reverse()
    .map((name) => {
      const filePath = path.join(MEMORY_DIR, name);
      const content = fs.readFileSync(filePath, "utf-8");
      const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
      return { name, wordCount };
    });

  return NextResponse.json({ files });
}

export async function PUT(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const file = searchParams.get("file");
  if (!file) {
    return NextResponse.json({ error: "file param required" }, { status: 400 });
  }
  const safe = sanitizeFilename(file);
  if (!safe) {
    return NextResponse.json({ error: "Invalid filename" }, { status: 400 });
  }

  const body = await req.json();
  const content: string = body.content ?? "";

  if (!fs.existsSync(MEMORY_DIR)) {
    fs.mkdirSync(MEMORY_DIR, { recursive: true });
  }

  const filePath = path.join(MEMORY_DIR, safe);
  fs.writeFileSync(filePath, content, "utf-8");
  return NextResponse.json({ ok: true });
}
