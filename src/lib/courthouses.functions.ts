import { createServerFn } from "@tanstack/react-start";
import Papa from "papaparse";
import { toSlug } from "./slug";

export type Courtroom = {
  name: string;
  zoom: string;
  signUpSheet: string;
  comments: string;
};

export type Courthouse = {
  name: string;
  slug: string;
  courtrooms: Courtroom[];
};

const SHEET_CSV_URL =
  "https://docs.google.com/spreadsheets/d/1I65fX5N6h7kX9t0iNyQll99kDEsmi6sySm7HmZ53Bn4/export?format=csv&gid=629952750";

const CACHE_TTL_MS = 5 * 60 * 1000;
let cache: { data: Courthouse[]; expires: number } | null = null;

async function fetchAndParse(): Promise<Courthouse[]> {
  const res = await fetch(SHEET_CSV_URL, {
    headers: { "cache-control": "no-cache" },
  });
  if (!res.ok) throw new Error(`Failed to fetch sheet: ${res.status}`);
  const text = await res.text();

  const parsed = Papa.parse<Record<string, string>>(text, {
    header: true,
    skipEmptyLines: true,
  });

  const grouped = new Map<string, Courthouse>();

  for (const row of parsed.data) {
    const courthouseName = (row["Courthouse"] ?? "").trim();
    if (!courthouseName) continue;
    const key = courthouseName.toUpperCase();
    let entry = grouped.get(key);
    if (!entry) {
      entry = {
        name: courthouseName,
        slug: toSlug(courthouseName),
        courtrooms: [],
      };
      grouped.set(key, entry);
    }
    entry.courtrooms.push({
      name: (row["Courtroom"] ?? "").trim(),
      zoom: row["Zoom"] ?? "",
      signUpSheet: row["Sign Up Sheet"] ?? "",
      comments: row["Comments"] ?? "",
    });
  }

  const cmp = (a: string, b: string) =>
    a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" });
  const houses = Array.from(grouped.values());
  for (const h of houses) {
    h.courtrooms.sort((a, b) => cmp(a.name, b.name));
  }
  return houses.sort((a, b) => cmp(a.name, b.name));
}

export const getCourthouses = createServerFn({ method: "GET" })
  .inputValidator((input: { force?: boolean } | undefined) => input ?? {})
  .handler(async ({ data }) => {
    const now = Date.now();
    if (!data.force && cache && cache.expires > now) {
      return cache.data;
    }
    try {
      const fresh = await fetchAndParse();
      cache = { data: fresh, expires: now + CACHE_TTL_MS };
      return fresh;
    } catch (err) {
      if (cache) return cache.data;
      throw err;
    }
  });
