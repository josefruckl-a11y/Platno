import { NextRequest, NextResponse } from "next/server";
import { searchMovies } from "@/lib/tmdb";

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get("q")?.trim();

  if (!query) {
    return NextResponse.json({ error: "Missing query parameter 'q'" }, { status: 400 });
  }

  try {
    const results = await searchMovies(query);
    return NextResponse.json({ results });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
