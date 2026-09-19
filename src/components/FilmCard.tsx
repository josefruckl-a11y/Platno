import { FilmResult } from "@/lib/types";

const SOURCE_LABELS: Record<string, string> = {
  Metacritic: "Metacritic",
  "Rotten Tomatoes": "Rotten Tomatoes",
  IMDb: "IMDb",
  TMDB: "TMDB",
};

export default function FilmCard({ film }: { film: FilmResult }) {
  const { tmdb, scoreResult } = film;
  const year = tmdb.release_date ? tmdb.release_date.slice(0, 4) : "";

  return (
    <div className="bg-card border border-text/10 rounded-md overflow-hidden">
      <div className="flex items-stretch">
        <div className="flex-1 p-4 min-w-0">
          <h2 className="font-display font-extrabold text-2xl leading-tight truncate">
            {tmdb.title}
          </h2>
          {year && <p className="text-sm opacity-70 mt-1">{year}</p>}
        </div>

        <div className="w-24 shrink-0 border-l border-dashed border-text/25 bg-accent flex items-center justify-center">
          {scoreResult.score !== null ? (
            <span className="font-display font-extrabold text-4xl text-[#16302B]">
              {scoreResult.score}
            </span>
          ) : (
            <span className="font-body text-sm text-[#16302B] px-2 text-center">
              no score
            </span>
          )}
        </div>
      </div>

      <div className="border-t border-text/10 p-4 space-y-2">
        {scoreResult.breakdown.map((s) => (
          <div key={s.name} className="flex items-baseline justify-between gap-3 text-sm">
            <span className="font-medium">{SOURCE_LABELS[s.name]}</span>
            <span className="flex-1 border-b border-dotted border-text/20 mx-1" />
            {s.included ? (
              <span className="whitespace-nowrap">
                {s.value} <span className="opacity-60">&middot; {s.weightPct}%</span>
              </span>
            ) : (
              <span className="whitespace-nowrap opacity-60">{s.reason}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
