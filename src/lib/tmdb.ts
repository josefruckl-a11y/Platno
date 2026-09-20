import { cacheGet, cacheSet } from "./db";

const TMDB_BASE = "https://api.themoviedb.org/3";

function apiKey(): string {
  const key = process.env.TMDB_API_KEY;
  if (!key) throw new Error("TMDB_API_KEY is not set in .env.local");
  return key;
}

export interface TmdbSearchResult {
  id: number;
  title: string;
  original_title: string;
  release_date: string | null;
  poster_path: string | null;
  overview: string;
  vote_average: number;
  vote_count: number;
}

export async function searchMovies(query: string): Promise<TmdbSearchResult[]> {
  const url = new URL(`${TMDB_BASE}/search/movie`);
  url.searchParams.set("api_key", apiKey());
  url.searchParams.set("language", "cs-CZ");
  url.searchParams.set("query", query);
  url.searchParams.set("include_adult", "false");

  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Error(`TMDB search failed: ${res.status}`);
  }
  const data = await res.json();
  return (data.results ?? []).slice(0, 5) as TmdbSearchResult[];
}

export interface TmdbMovieDetails {
  id: number;
  imdb_id: string | null;
  vote_average: number;
  vote_count: number;
  title: string;
  poster_path: string | null;
  release_date: string | null;
}

export async function getMovieDetails(tmdbId: number): Promise<TmdbMovieDetails> {
  const cacheKey = `tmdb:details:${tmdbId}`;
  const cached = await cacheGet<TmdbMovieDetails>(cacheKey);
  if (cached) return cached;

  const url = new URL(`${TMDB_BASE}/movie/${tmdbId}`);
  url.searchParams.set("api_key", apiKey());
  url.searchParams.set("language", "cs-CZ");
  url.searchParams.set("append_to_response", "external_ids");

  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Error(`TMDB movie details failed: ${res.status}`);
  }
  const data = await res.json();

  const details: TmdbMovieDetails = {
    id: data.id,
    imdb_id: data.external_ids?.imdb_id ?? data.imdb_id ?? null,
    vote_average: data.vote_average,
    vote_count: data.vote_count,
    title: data.title,
    poster_path: data.poster_path,
    release_date: data.release_date,
  };

  await cacheSet(cacheKey, details);
  return details;
}
