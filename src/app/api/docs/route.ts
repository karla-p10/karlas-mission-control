import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const WORKSPACE = "/data/.openclaw/workspace";

interface DocEntry {
  file: string;
  emoji: string;
  label: string;
  group: "Core" | "Content";
}

const WHITELIST: DocEntry[] = [
  { file: "MEMORY.md", emoji: "🧠", label: "Long-Term Memory", group: "Core" },
  { file: "SOUL.md", emoji: "✨", label: "Soul & Personality", group: "Core" },
  { file: "USER.md", emoji: "👤", label: "About Karla", group: "Core" },
  { file: "TOOLS.md", emoji: "🔧", label: "Tools & Config", group: "Core" },
  { file: "memory/karla-voice-profile.md", emoji: "🎙️", label: "Karla Voice Profile", group: "Content" },
  { file: "memory/gabriel-voice-profile.md", emoji: "🎙️", label: "Gabriel Voice Profile", group: "Content" },
  { file: "memory/karla-linkedin-master-framework-v1.md", emoji: "💼", label: "LinkedIn Framework", group: "Content" },
  { file: "memory/gabriel-writing-guidelines.md", emoji: "✍️", label: "Gabriel Writing Guidelines", group: "Content" },
];

function isWhitelisted(file: string): DocEntry | undefined {
  return WHITELIST.find((e) => e.file === file);
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const file = searchParams.get("file");

  if (file) {
    const entry = isWhitelisted(file);
    if (!entry) {
      return NextResponse.json({ error: "Not allowed" }, { status: 403 });
    }
    const filePath = path.join(WORKSPACE, entry.file);
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }
    const content = fs.readFileSync(filePath, "utf-8");
    return NextResponse.json({ ...entry, content });
  }

  // List all whitelisted docs with existence check
  const docs = WHITELIST.map((entry) => {
    const filePath = path.join(WORKSPACE, entry.file);
    const exists = fs.existsSync(filePath);
    const wordCount = exists
      ? fs.readFileSync(filePath, "utf-8").trim().split(/\s+/).filter(Boolean).length
      : 0;
    return { ...entry, exists, wordCount };
  });

  return NextResponse.json({ docs });
}

export async function PUT(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const file = searchParams.get("file");
  if (!file) {
    return NextResponse.json({ error: "file param required" }, { status: 400 });
  }
  const entry = isWhitelisted(file);
  if (!entry) {
    return NextResponse.json({ error: "Not allowed" }, { status: 403 });
  }

  const body = await req.json();
  const content: string = body.content ?? "";

  const filePath = path.join(WORKSPACE, entry.file);
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(filePath, content, "utf-8");
  return NextResponse.json({ ok: true });
}
