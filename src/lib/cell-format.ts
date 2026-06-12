export type CellSegment =
  | { kind: "link"; href: string; label: string }
  | { kind: "text"; value: string }
  | { kind: "empty" };

const EMPTY_TOKENS = new Set(["", "no", "n/a", "none", "-"]);

export function parseCell(raw: string | undefined | null): CellSegment[] {
  if (!raw) return [{ kind: "empty" }];
  const trimmed = raw.trim();
  if (!trimmed || EMPTY_TOKENS.has(trimmed.toLowerCase())) {
    return [{ kind: "empty" }];
  }

  const lines = trimmed
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  return lines.map<CellSegment>((line) => {
    if (/^https?:\/\//i.test(line)) {
      let host = line;
      try {
        host = new URL(line).hostname.replace(/^www\./, "");
      } catch {
        // keep raw
      }
      return { kind: "link", href: line, label: host };
    }
    return { kind: "text", value: line };
  });
}

export function isEmptyCell(segments: CellSegment[]): boolean {
  return segments.length === 1 && segments[0].kind === "empty";
}
