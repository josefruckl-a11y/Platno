export type SourceName = "Metacritic" | "Rotten Tomatoes" | "IMDb" | "TMDB";

const BASE_WEIGHTS: Record<SourceName, number> = {
  Metacritic: 35,
  "Rotten Tomatoes": 25,
  IMDb: 25,
  TMDB: 15,
};

const MIN_VOTES = 100;

export interface SourceInput {
  name: SourceName;
  /** Rating already converted to a 0-100 scale, or null if unavailable. */
  value: number | null;
  /** Vote count, only meaningful for IMDb and TMDB. */
  votes?: number | null;
}

export interface SourceBreakdown {
  name: SourceName;
  value: number | null;
  votes: number | null;
  included: boolean;
  weightPct: number;
  reason: string | null;
}

export interface ScoreResult {
  score: number | null;
  breakdown: SourceBreakdown[];
}

const VOTE_GATED: SourceName[] = ["IMDb", "TMDB"];

export function computeScore(sources: SourceInput[]): ScoreResult {
  const decided = sources.map((s) => {
    const votes = s.votes ?? null;
    let included = true;
    let reason: string | null = null;

    if (s.value === null || s.value === undefined) {
      included = false;
      reason = "No rating available";
    } else if (VOTE_GATED.includes(s.name) && (votes === null || votes < MIN_VOTES)) {
      included = false;
      reason = `Fewer than ${MIN_VOTES} votes${votes !== null ? ` (${votes})` : ""}`;
    }

    return { name: s.name, value: s.value ?? null, votes, included, reason };
  });

  const totalWeight = decided
    .filter((s) => s.included)
    .reduce((sum, s) => sum + BASE_WEIGHTS[s.name], 0);

  if (totalWeight === 0) {
    return {
      score: null,
      breakdown: decided.map((s) => ({ ...s, weightPct: 0 })),
    };
  }

  let scoreRaw = 0;
  const breakdown: SourceBreakdown[] = decided.map((s) => {
    if (!s.included) {
      return { ...s, weightPct: 0 };
    }
    const fraction = BASE_WEIGHTS[s.name] / totalWeight;
    scoreRaw += (s.value as number) * fraction;
    return { ...s, weightPct: Math.round(fraction * 100) };
  });

  return { score: Math.round(scoreRaw), breakdown };
}
