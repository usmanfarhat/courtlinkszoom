import { useState } from "react";
import { Copy, Check, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { parseCell, isEmptyCell, type CellSegment } from "@/lib/cell-format";

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async (e) => {
        e.preventDefault();
        e.stopPropagation();
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          toast.success("Copied to clipboard");
          setTimeout(() => setCopied(false), 1500);
        } catch {
          toast.error("Couldn't copy");
        }
      }}
      className="inline-flex items-center justify-center size-8 rounded-md text-brand-muted hover:bg-zinc-100 hover:text-brand-fg transition-colors shrink-0"
      aria-label={`Copy ${value}`}
    >
      {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
    </button>
  );
}

export function hasContent(raw: string | undefined | null): boolean {
  return !isEmptyCell(parseCell(raw));
}

export function SmartCell({ raw, linkLabel }: { raw: string | undefined | null; linkLabel?: string }) {
  const segments: CellSegment[] = parseCell(raw);
  if (isEmptyCell(segments)) {
    return <span className="text-zinc-300">—</span>;
  }
  return (
    <div className="flex flex-col gap-1.5">
      {segments.map((seg, i) => {
        if (seg.kind === "empty") return null;
        if (seg.kind === "link") {
          return (
            <div key={i} className="flex items-center gap-1.5 min-w-0">
              <a
                href={seg.href}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-1.5 min-w-0 px-3 h-8 rounded-md bg-brand-fg text-white text-sm font-medium hover:bg-brand-fg/85 transition-colors no-underline"
              >
                <ExternalLink className="size-3.5 shrink-0" />
                <span className="truncate">{linkLabel ?? seg.label}</span>
              </a>
              <CopyButton value={seg.href} />
            </div>
          );
        }
        return (
          <div key={i} className="flex items-center gap-1.5 min-w-0">
            <span className="font-mono text-sm text-brand-fg truncate">{seg.value}</span>
            <CopyButton value={seg.value} />
          </div>
        );
      })}
    </div>
  );
}
