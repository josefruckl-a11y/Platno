import { NextRequest, NextResponse } from "next/server";
import { getFilmScore } from "@/lib/combine";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const tmdbId = parseInt(id, 10);

  if (Number.isNaN(tmdbId)) {
    return NextResponse.json({ error: "Invalid film id" }, { status: 400 });
  }

  try {
    const result = await getFilmScore(tmdbId);
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
