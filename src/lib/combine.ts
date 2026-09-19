import { getMovieDetails, TmdbMovieDetails } from "./tmdb";
import { getRatingsByImdbId, OmdbResponse } from "./omdb";
import { computeScore, SourceInput, ScoreResult } from "./score";

function parseVotes(raw: string | undefined): number | null {
  if (!raw || raw === "N/A") return null;
  const n = parseInt(raw.replace(/,/g, ""), 10);
  return Number.isNaN(n) ? null : n;
}

function parseOmdbSource(omdb: OmdbResponse, sourceName: string): number | null {
  const rating = omdb.Ratings?.find((r) => r.Source === sourceName);
  if (!rating) return null;

  if (sourceName === "Rotten Tomatoes") {
    const n = parseInt(rating.Value.replace("%", ""), 10);
    return Number.isNaN(n) ? null : n;
  }

  if (sourceName === "Metacritic") {
    const n = parseInt(rating.Value.split("/")[0], 10);
    return Number.isNaN(n) ? null : n;
  }

  return null;
}

function parseImdbRating(omdb: OmdbResponse): number | null {
  if (!omdb.imdbRating || omdb.imdbRating === "N/A") return null;
  const n = parseFloat(omdb.imdbRating);
  return Number.isNaN(n) ? null : Math.round(n * 10);
}

export interface FilmResult {
  tmdb: TmdbMovieDetails;
  omdb: OmdbResponse | null;
  scoreResult: ScoreResult;
}

export async function getFilmScore(tmdbId: number): Promise<FilmResult> {
  const tmdb = await getMovieDetails(tmdbId);

  const tmdbValue =
    tmdb.vote_average !== undefined && tmdb.vote_average !== null
      ? Math.round(tmdb.vote_average * 10)
      : null;

  let omdb: OmdbResponse | null = null;
  let metacriticValue: number | null = null;
  let rtValue: number | null = null;
  let imdbValue: number | null = null;
  let imdbVotes: number | null = null;

  if (tmdb.imdb_id) {
    try {
      omdb = await getRatingsByImdbId(tmdb.imdb_id);
      metacriticValue = parseOmdbSource(omdb, "Metacritic");
      rtValue = parseOmdbSource(omdb, "Rotten Tomatoes");
      imdbValue = parseImdbRating(omdb);
      imdbVotes = parseVotes(omdb.imdbVotes);
    } catch {
      omdb = null;
    }
  }

  const sources: SourceInput[] = [
    { name: "Metacritic", value: metacriticValue },
    { name: "Rotten Tomatoes", value: rtValue },
    { name: "IMDb", value: imdbValue, votes: imdbVotes },
    { name: "TMDB", value: tmdbValue, votes: tmdb.vote_count ?? null },
  ];

  const scoreResult = computeScore(sources);

  return { tmdb, omdb, scoreResult };
}
