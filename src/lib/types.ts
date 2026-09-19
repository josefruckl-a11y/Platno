export interface SearchResult {
  id: number;
  title: string;
  original_title: string;
  release_date: string | null;
  poster_path: string | null;
  overview: string;
  vote_average: number;
  vote_count: number;
}

export interface SourceBreakdown {
  name: "Metacritic" | "Rotten Tomatoes" | "IMDb" | "TMDB";
  value: number | null;
  votes: number | null;
  included: boolean;
  weightPct: number;
  reason: string | null;
}

export interface FilmResult {
  tmdb: {
    id: number;
    imdb_id: string | null;
    title: string;
    poster_path: string | null;
    release_date: string | null;
  };
  scoreResult: {
    score: number | null;
    breakdown: SourceBreakdown[];
  };
}
