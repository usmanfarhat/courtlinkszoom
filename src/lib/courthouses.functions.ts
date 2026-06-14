import { createServerFn } from "@tanstack/react-start";
import Papa from "papaparse";
import { toSlug } from "./slug";

export type Courtroom = {
  name: string;
  zoom: string;
  signUpSheet: string;
  comments: string;
};

export type DetailField = {
  label: string;
  value: string;
  kind: "email" | "phone" | "address" | "text";
};

export type Courthouse = {
  name: string;
  slug: string;
  courtrooms: Courtroom[];
  details: DetailField[];
};

const SHEET_ID = "1I65fX5N6h7kX9t0iNyQll99kDEsmi6sySm7HmZ53Bn4";
const COURTROOMS_CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=629952750`;
const DETAILS_CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=Courthouse_Details`;

const CACHE_TTL_MS = 5 * 60 * 1000;
let cache: { data: Courthouse[]; expires: number } | null = null;

function classifyField(label: string): DetailField["kind"] {
  const l = label.toLowerCase();
  if (l.includes("email")) return "email";
  if (l.includes("phone")) return "phone";
  if (l.includes("address")) return "address";
  return "text";
}

async function fetchAndParse(): Promise<Courthouse[]> {
  const [roomsRes, detailsRes] = await Promise.all([
    fetch(COURTROOMS_CSV_URL, { headers: { "cache-control": "no-cache" } }),
    fetch(DETAILS_CSV_URL, { headers: { "cache-control": "no-cache" } }),
  ]);
  if (!roomsRes.ok) throw new Error(`Failed to fetch courtrooms: ${roomsRes.status}`);

  const roomsText = await roomsRes.text();
  const detailsText = detailsRes.ok ? await detailsRes.text() : "";

  const roomsParsed = Papa.parse<Record<string, string>>(roomsText, {
    header: true,
    skipEmptyLines: true,
  });

  const detailsParsed = detailsText
    ? Papa.parse<Record<string, string>>(detailsText, {
        header: true,
        skipEmptyLines: true,
      })
    : { data: [], meta: { fields: [] as string[] } };

  const detailFields = (detailsParsed.meta.fields ?? []).filter(
    (f) => f && f.trim() && f !== "Courthouse",
  );
  const detailsBySlug = new Map<string, DetailField[]>();
  for (const row of detailsParsed.data) {
    const name = (row["Courthouse"] ?? "").trim();
    if (!name) continue;
    const fields: DetailField[] = [];
    for (const f of detailFields) {
      const v = (row[f] ?? "").trim();
      if (!v) continue;
      fields.push({ label: f, value: v, kind: classifyField(f) });
    }
    detailsBySlug.set(toSlug(name), fields);
  }

  const grouped = new Map<string, Courthouse>();

  // Seed from Courthouse_Details so locations without zoom rows still appear.
  for (const row of detailsParsed.data) {
    const courthouseName = (row["Courthouse"] ?? "").trim();
    if (!courthouseName) continue;
    const key = courthouseName.toUpperCase();
    if (grouped.has(key)) continue;
    const slug = toSlug(courthouseName);
    grouped.set(key, {
      name: courthouseName,
      slug,
      courtrooms: [],
      details: detailsBySlug.get(slug) ?? [],
    });
  }

  for (const row of roomsParsed.data) {
    const courthouseName = (row["Courthouse"] ?? "").trim();
    if (!courthouseName) continue;
    const key = courthouseName.toUpperCase();
    let entry = grouped.get(key);
    if (!entry) {
      const slug = toSlug(courthouseName);
      entry = {
        name: courthouseName,
        slug,
        courtrooms: [],
        details: detailsBySlug.get(slug) ?? [],
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
