import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

// Smart natural language task parser — no external AI API needed
function parseTaskInput(input: string) {
  const result: {
    title: string;
    priority: "low" | "medium" | "high" | "urgent";
    category: string;
    dueDate: string | null;
    tags: string[];
    recurring: "none" | "daily" | "weekly" | "monthly";
  } = {
    title: input.trim(),
    priority: "medium",
    category: "general",
    dueDate: null,
    tags: [],
    recurring: "none",
  };

  let text = input.trim();

  // Extract priority
  const priorityPatterns: [RegExp, "low" | "medium" | "high" | "urgent"][] = [
    [/\b(urgent|asap|critical|!!+)\b/i, "urgent"],
    [/\b(high priority|important|high)\b/i, "high"],
    [/\b(low priority|low|minor)\b/i, "low"],
  ];
  for (const [pattern, prio] of priorityPatterns) {
    if (pattern.test(text)) {
      result.priority = prio;
      text = text.replace(pattern, "").trim();
      break;
    }
  }

  // Extract recurring
  const recurringPatterns: [RegExp, "daily" | "weekly" | "monthly"][] = [
    [/\b(every\s*day|daily)\b/i, "daily"],
    [/\b(every\s*week|weekly)\b/i, "weekly"],
    [/\b(every\s*month|monthly)\b/i, "monthly"],
  ];
  for (const [pattern, freq] of recurringPatterns) {
    if (pattern.test(text)) {
      result.recurring = freq;
      text = text.replace(pattern, "").trim();
      break;
    }
  }

  // Extract due date
  const now = new Date();
  const datePatterns: [RegExp, () => Date][] = [
    [/\btoday\b/i, () => now],
    [
      /\btomorrow\b/i,
      () => {
        const d = new Date(now);
        d.setDate(d.getDate() + 1);
        return d;
      },
    ],
    [
      /\bnext\s*week\b/i,
      () => {
        const d = new Date(now);
        d.setDate(d.getDate() + 7);
        return d;
      },
    ],
    [
      /\bnext\s*month\b/i,
      () => {
        const d = new Date(now);
        d.setMonth(d.getMonth() + 1);
        return d;
      },
    ],
    [
      /\bin\s*(\d+)\s*days?\b/i,
      () => {
        const match = text.match(/\bin\s*(\d+)\s*days?\b/i);
        const d = new Date(now);
        d.setDate(d.getDate() + parseInt(match![1]));
        return d;
      },
    ],
    [
      /\bon\s*(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i,
      () => {
        const match = text.match(
          /\bon\s*(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i
        );
        const days = [
          "sunday",
          "monday",
          "tuesday",
          "wednesday",
          "thursday",
          "friday",
          "saturday",
        ];
        const target = days.indexOf(match![1].toLowerCase());
        const d = new Date(now);
        const diff = (target - d.getDay() + 7) % 7 || 7;
        d.setDate(d.getDate() + diff);
        return d;
      },
    ],
  ];
  for (const [pattern, getDate] of datePatterns) {
    if (pattern.test(text)) {
      result.dueDate = getDate().toISOString().split("T")[0];
      text = text.replace(pattern, "").trim();
      break;
    }
  }

  // Extract category
  const categoryPatterns: [RegExp, string][] = [
    [/\b(work|office|meeting|project)\b/i, "work"],
    [/\b(personal|home|family)\b/i, "personal"],
    [/\b(shop|buy|grocery|groceries|shopping)\b/i, "shopping"],
    [/\b(health|gym|exercise|workout|doctor|medical)\b/i, "health"],
    [/\b(learn|study|read|course|book)\b/i, "learning"],
    [/\b(money|pay|bill|bank|finance|budget)\b/i, "finance"],
  ];
  for (const [pattern, cat] of categoryPatterns) {
    if (pattern.test(text)) {
      result.category = cat;
      break;
    }
  }

  // Extract #tags
  const tagMatches = text.match(/#(\w+)/g);
  if (tagMatches) {
    result.tags = tagMatches.map((t) => t.slice(1));
    text = text.replace(/#\w+/g, "").trim();
  }

  // Clean up title
  result.title = text.replace(/\s+/g, " ").trim();
  if (!result.title) result.title = input.trim();

  return result;
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { input } = await request.json();
    if (!input || typeof input !== "string") {
      return NextResponse.json({ error: "Input required" }, { status: 400 });
    }

    const parsed = parseTaskInput(input);
    return NextResponse.json(parsed);
  } catch (error) {
    console.error("POST /api/ai/parse-task error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
