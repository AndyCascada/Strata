import { NextRequest, NextResponse } from "next/server";
import { runDailyAnalysis } from "@/lib/analyze";
import { yesterday, isValidDate } from "@/lib/dates";

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-cron-secret");
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const date: string = body.date ?? yesterday();

  if (!isValidDate(date)) {
    return NextResponse.json({ error: "Invalid date format. Use YYYY-MM-DD." }, { status: 400 });
  }

  try {
    const count = await runDailyAnalysis(date);
    return NextResponse.json({ date, analyzed: count });
  } catch (err) {
    console.error("Analysis failed", err);
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 });
  }
}
