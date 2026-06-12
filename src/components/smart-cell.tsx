import { useState } from "react";
import { Copy, Check, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { parseCell, isEmptyCell } from "@/lib/cell-format";

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          toast.success("Copied to clipboard");
          setTimeout(() => setCopied(false), 1500);
        } catch {
          toast.error("Couldn't copy");
        }
      }}
      className="inline-flex items-center justify-center size-6 rounded text-brand-muted hover:bg-zinc-100 hover:text-brand-fg transition-colors shrink-0"
      aria-label={`Copy ${value}`}
    >
      {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
    </button>
  );
}

export function SmartCell({ raw }: { raw: string | undefined | null }) {
  const segments = parseCell(raw);
  if (isEmptyCell(segments)) {
    return <span className="text-zinc-300">—</span>;
  }
  return (
    <div className="flex flex-col gap-1.5">
      {segments.map((seg, i) => {
        if (seg.kind === "empty") return null;
        if (seg.kind === "link") {
          return (
            <div key={i} className="flex items-center gap-2 min-w-0">
              <a
                href={seg.href}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-1.5 text-sm text-brand-fg underline decoration-zinc-300 hover:decoration-brand-fg underline-offset-4 truncate"
              >
                <ExternalLink className="size-3.5 shrink-0" />
                <span className="truncate">{seg.label}</span>
              </a>
              <CopyButton value={seg.href} />
            </div>
          );
        }
        return (
          <div key={i} className="flex items-center gap-2 min-w-0">
            <span className="font-mono text-sm text-brand-fg truncate">{seg.value}</span>
            <CopyButton value={seg.value} />
          </div>
        );
      })}
    </div>
  );
}
