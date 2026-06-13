import { useState } from "react";
import { Copy, Check, Mail, Phone, MapPin, Info } from "lucide-react";
import { toast } from "sonner";
import type { DetailField } from "@/lib/courthouses.functions";

function CopyBtn({ value }: { value: string }) {
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
          toast.success("Copied");
          setTimeout(() => setCopied(false), 1500);
        } catch {
          toast.error("Couldn't copy");
        }
      }}
      className="inline-flex items-center justify-center size-5 rounded text-brand-muted hover:bg-zinc-200 hover:text-brand-fg transition-colors shrink-0"
      aria-label={`Copy ${value}`}
    >
      {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
    </button>
  );
}

export function DetailFieldRow({ field }: { field: DetailField }) {
  const { label, value, kind } = field;
  let href: string | null = null;
  let Icon = Info;
  if (kind === "email") {
    href = `mailto:${value}`;
    Icon = Mail;
  } else if (kind === "phone") {
    href = `tel:${value.replace(/[^0-9+]/g, "")}`;
    Icon = Phone;
  } else if (kind === "address") {
    href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(value)}`;
    Icon = MapPin;
  }

  return (
    <div className="flex items-start gap-2 py-1.5 min-w-0">
      <Icon className="size-3.5 text-brand-muted mt-0.5 shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-brand-muted leading-none mb-0.5">
          {label}
        </p>
        <div className="flex items-center gap-1.5 min-w-0">
          {href ? (
            <a
              href={href}
              target={kind === "address" ? "_blank" : undefined}
              rel={kind === "address" ? "noreferrer noopener" : undefined}
              className="text-sm text-brand-fg underline decoration-zinc-300 hover:decoration-brand-fg underline-offset-4 truncate"
            >
              {value}
            </a>
          ) : (
            <span className="text-sm text-brand-fg break-words">{value}</span>
          )}
          {kind !== "text" && <CopyBtn value={value} />}
        </div>
      </div>
    </div>
  );
}
