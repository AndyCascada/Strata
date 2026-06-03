import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { yesterday, isValidDate } from "@/lib/dates";
import { mapRowToHeadline } from "@/lib/headlines";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const dateParam = searchParams.get("date") ?? yesterday();

  if (!isValidDate(dateParam)) {
    return NextResponse.json({ error: "Invalid date format. Use YYYY-MM-DD." }, { status: 400 });
  }

  const rows = await prisma.headline.findMany({
    where: { forDate: dateParam },
    orderBy: { analyzedAt: "asc" },
  });

  const headlines = rows.map(mapRowToHeadline);

  return NextResponse.json({ date: dateParam, headlines });
}
