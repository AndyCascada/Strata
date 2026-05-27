import { NextRequest, NextResponse } from "next/server";
import { runDailyAnalysis } from "@/lib/analyze";

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-cron-secret");
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const date: string = body.date ?? yesterday();

  try {
    const count = await runDailyAnalysis(date);
    return NextResponse.json({ date, analyzed: count });
  } catch (err) {
    console.error("Analysis failed", err);
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 });
  }
}

function yesterday(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split("T")[0];
}
