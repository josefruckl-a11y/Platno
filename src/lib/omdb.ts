import { cacheGet, cacheSet } from "./db";

function apiKey(): string {
  const key = process.env.OMDB_API_KEY;
  if (!key) throw new Error("OMDB_API_KEY is not set in .env.local");
  return key;
}

export interface OmdbRating {
  Source: string;
  Value: string;
}

export interface OmdbResponse {
  Response: "True" | "False";
  Error?: string;
  Ratings?: OmdbRating[];
  imdbRating?: string;
  imdbVotes?: string;
  Title?: string;
}

export async function getRatingsByImdbId(imdbId: string): Promise<OmdbResponse> {
  const cacheKey = `omdb:${imdbId}`;
  const cached = cacheGet<OmdbResponse>(cacheKey);
  if (cached) return cached;

  const url = new URL("https://www.omdbapi.com/");
  url.searchParams.set("apikey", apiKey());
  url.searchParams.set("i", imdbId);

  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Error(`OMDb request failed: ${res.status}`);
  }
  const data = (await res.json()) as OmdbResponse;

  if (data.Response === "False") {
    throw new Error(data.Error ?? "OMDb returned an error");
  }

  cacheSet(cacheKey, data);
  return data;
}
