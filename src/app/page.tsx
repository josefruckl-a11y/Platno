"use client";

import { useState } from "react";
import FilmCard from "@/components/FilmCard";
import { SearchResult, FilmResult } from "@/lib/types";

type Status = "idle" | "searching" | "loading-score" | "error";

export default function Home() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [film, setFilm] = useState<FilmResult | null>(null);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;

    setStatus("searching");
    setError(null);
    setFilm(null);
    setResults([]);

    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Search failed");
      setResults(data.results);
      setStatus("idle");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed");
      setStatus("error");
    }
  }

  async function handlePick(id: number) {
    setStatus("loading-score");
    setError(null);
    setResults([]);

    try {
      const res = await fetch(`/api/film/${id}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not load ratings");
      setFilm(data);
      setStatus("idle");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load ratings");
      setStatus("error");
    }
  }

  return (
    <div className="flex-1 bg-bg text-text">
      <main className="mx-auto w-full max-w-[720px] px-4 py-6 flex flex-col gap-6">
        <h1 className="font-display font-extrabold text-4xl">Plátno</h1>

        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search a film title..."
            className="flex-1 bg-card border border-text/20 rounded-md px-3 py-2 text-base outline-none focus:border-accent"
          />
          <button
            type="submit"
            className="bg-accent text-[#16302B] font-medium px-4 py-2 rounded-md"
          >
            Search
          </button>
        </form>

        {status === "searching" && <p className="opacity-70">Searching...</p>}
        {status === "loading-score" && <p className="opacity-70">Fetching ratings...</p>}
        {status === "error" && error && (
          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
        )}

        {results.length > 0 && (
          <ul className="flex flex-col gap-2">
            {results.map((r) => (
              <li key={r.id}>
                <button
                  onClick={() => handlePick(r.id)}
                  className="w-full text-left bg-card border border-text/10 rounded-md px-3 py-2 flex items-baseline justify-between gap-2"
                >
                  <span className="font-medium">{r.title}</span>
                  <span className="text-sm opacity-60 shrink-0">
                    {r.release_date ? r.release_date.slice(0, 4) : ""}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}

        {film && <FilmCard film={film} />}
      </main>
    </div>
  );
}
