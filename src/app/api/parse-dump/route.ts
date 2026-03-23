import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

function getOpenAI() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;
  return new OpenAI({ apiKey });
}

interface CategoryInfo {
  id: string;
  name: string;
}

interface ParsedTask {
  title: string;
  description?: string;
  category: string;
  priority: "low" | "medium" | "high";
}

export async function POST(request: NextRequest) {
  try {
    const { text, categories } = (await request.json()) as {
      text: string;
      categories: CategoryInfo[];
    };

    if (!text?.trim()) {
      return NextResponse.json({ error: "No text provided" }, { status: 400 });
    }

    const openai = getOpenAI();
    if (!openai) {
      return NextResponse.json(
        { error: "AI not configured", fallback: true },
        { status: 503 }
      );
    }

    const categoryList = categories
      .map((c) => `- "${c.name}" (id: "${c.id}")`)
      .join("\n");

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.3,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `You are Rosie, an AI assistant that helps busy moms organize their thoughts into actionable tasks.

You receive a raw "brain dump" — a stream of consciousness text where someone has written down everything on their mind. Your job is to:

1. UNDERSTAND the text as a whole — don't just split by sentences
2. EXTRACT real, actionable tasks from the text
3. CONSOLIDATE related thoughts into single tasks (e.g., if someone mentions meal planning with specific ingredients across multiple sentences, that's ONE task about meal planning, with the details in the description)
4. CATEGORIZE each task into the user's existing categories
5. SET priority intelligently (urgent/time-sensitive = high, important but flexible = medium, nice-to-have = low)
6. Write clear, concise task TITLES (action-oriented, 5-10 words)
7. Add helpful DESCRIPTIONS with relevant details from the original text

Available categories:
${categoryList}

Respond with a JSON object: { "tasks": [...] }
Each task: { "title": string, "description": string, "category": string (use the category id), "priority": "low"|"medium"|"high" }

Rules:
- Extract ACTIONABLE items only — skip filler/thinking-out-loud that isn't a task
- Consolidate related items (don't split "buy milk, eggs, bread" into 3 tasks — that's one grocery task)
- If something doesn't fit any category, use the closest match
- Descriptions should capture useful context from the original text
- Be smart about priority: deadlines and time-sensitive things are high, routine stuff is medium, "someday" things are low
- Typical brain dumps produce 3-8 real tasks, not 15+`,
        },
        {
          role: "user",
          content: text,
        },
      ],
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      return NextResponse.json({ error: "No response from AI" }, { status: 500 });
    }

    const parsed = JSON.parse(content) as { tasks: ParsedTask[] };

    // Validate category ids — fall back to first category if invalid
    const validCategoryIds = new Set(categories.map((c) => c.id));
    const fallbackCategory = categories[0]?.id ?? "personal";

    const validatedTasks = parsed.tasks.map((task) => ({
      ...task,
      category: validCategoryIds.has(task.category) ? task.category : fallbackCategory,
      priority: (["low", "medium", "high"].includes(task.priority) ? task.priority : "medium") as "low" | "medium" | "high",
    }));

    return NextResponse.json({ tasks: validatedTasks });
  } catch (error) {
    console.error("Brain dump parse error:", error);
    return NextResponse.json(
      { error: "Failed to parse brain dump", fallback: true },
      { status: 500 }
    );
  }
}
