import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { ChevronLeft, Search, ChevronDown, Mail, Phone } from "lucide-react";
import { getCourthouses } from "@/lib/courthouses.functions";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { SmartCell } from "@/components/smart-cell";

const courthousesQuery = queryOptions({
  queryKey: ["courthouses"],
  queryFn: () => getCourthouses({ data: {} }),
});

export const Route = createFileRoute("/courthouse/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.slug.replace(/-/g, " ")} — CourtDir` },
      {
        name: "description",
        content: `Courtroom Zoom links, dial-in numbers, and sign-up sheets for the ${params.slug.replace(/-/g, " ")} courthouse.`,
      },
    ],
  }),
  loader: async ({ context, params }) => {
    const all = await context.queryClient.ensureQueryData(courthousesQuery);
    const match = all.find((c) => c.slug === params.slug);
    if (!match) throw notFound();
    return match;
  },
  component: CourthousePage,
  notFoundComponent: () => (
    <>
      <SiteHeader />
      <main className="max-w-7xl mx-auto px-6 py-24 text-center">
        <h1 className="font-serif text-5xl mb-4">Courthouse not found</h1>
        <p className="text-brand-muted mb-8">We couldn't find that location in the registry.</p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-brand-fg hover:underline"
        >
          <ChevronLeft className="size-4" /> Back to directory
        </Link>
      </main>
      <SiteFooter />
    </>
  ),
  errorComponent: ({ error }) => (
    <div className="min-h-screen flex items-center justify-center p-6">
      <p className="text-brand-muted">{error.message}</p>
    </div>
  ),
});

function CourthousePage() {
  const { slug } = Route.useParams();
  const { data: all } = useSuspenseQuery(courthousesQuery);
  const courthouse = all.find((c) => c.slug === slug)!;

  const [query, setQuery] = useState("");
  const [openRooms, setOpenRooms] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return courthouse.courtrooms;
    return courthouse.courtrooms.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.zoom.toLowerCase().includes(q) ||
        r.comments.toLowerCase().includes(q),
    );
  }, [courthouse.courtrooms, query]);

  const toggle = (name: string) =>
    setOpenRooms((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });

  return (
    <>
      <SiteHeader />
      <main className="py-12">
        <section className="max-w-7xl mx-auto px-6 mb-8">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-brand-muted hover:text-brand-fg transition-colors mb-6"
          >
            <ChevronLeft className="size-3.5" /> Directory
          </Link>

          <div className="rounded-lg ring-1 ring-black/5 bg-white overflow-hidden">
            <div className="p-8 border-b border-zinc-200/60">
              <p className="text-xs font-semibold uppercase tracking-widest text-brand-muted mb-2">
                Courthouse
              </p>
              <h1 className="text-4xl md:text-5xl font-serif leading-tight text-balance capitalize">
                {courthouse.name.toLowerCase()}
              </h1>
              <p className="mt-3 text-brand-muted text-sm">
                {courthouse.courtrooms.length} courtroom
                {courthouse.courtrooms.length === 1 ? "" : "s"} on file.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-zinc-200/60">
              <div className="p-6">
                <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-brand-muted mb-2">
                  Trial Coordinator
                </p>
                <p className="text-sm text-brand-fg flex items-center gap-2">
                  <Mail className="size-3.5 text-brand-muted" /> tbd@ontario.ca
                </p>
              </div>
              <div className="p-6">
                <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-brand-muted mb-2">
                  Registry
                </p>
                <p className="text-sm text-brand-fg flex items-center gap-2">
                  <Phone className="size-3.5 text-brand-muted" /> (000) 000-0000
                </p>
              </div>
              <div className="p-6">
                <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-brand-muted mb-2">
                  Hours
                </p>
                <p className="text-sm text-brand-fg">Mon–Fri · 9:00am–5:00pm</p>
              </div>
            </div>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-6 mb-6">
          <div className="flex items-center gap-2 p-1 bg-zinc-100 rounded-lg ring-1 ring-black/5">
            <div className="pl-3 text-brand-muted">
              <Search className="size-4" />
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filter courtrooms..."
              className="flex-1 h-11 px-2 bg-transparent border-none outline-none text-sm text-brand-fg placeholder:text-zinc-400"
            />
            <span className="pr-4 text-xs text-brand-muted">
              {filtered.length} / {courthouse.courtrooms.length}
            </span>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-zinc-200/60">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-brand-muted">
              Courtrooms
            </h2>
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-16 text-brand-muted">
              <p className="font-serif text-xl">No courtrooms match that filter.</p>
            </div>
          ) : (
            <ul className="divide-y divide-zinc-200/60 ring-1 ring-black/5 rounded-lg bg-white overflow-hidden">
              {filtered.map((room, idx) => {
                const key = `${room.name}-${idx}`;
                const isOpen = openRooms.has(key);
                return (
                  <li key={key}>
                    <button
                      type="button"
                      onClick={() => toggle(key)}
                      className="w-full flex items-center justify-between gap-4 px-6 py-4 text-left hover:bg-zinc-50/60 transition-colors"
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        <span className="font-mono text-xs text-brand-muted w-10 shrink-0">
                          {String(idx + 1).padStart(2, "0")}
                        </span>
                        <span className="font-medium text-brand-fg">
                          {room.name || "—"}
                        </span>
                      </div>
                      <ChevronDown
                        className={`size-4 text-brand-muted transition-transform ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-6 pb-6 pt-1 bg-zinc-50/40 grid grid-cols-1 md:grid-cols-3 gap-6 border-t border-zinc-200/40">
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-brand-muted mb-2">
                            Zoom
                          </p>
                          <SmartCell raw={room.zoom} />
                        </div>
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-brand-muted mb-2">
                            Sign Up Sheet
                          </p>
                          <SmartCell raw={room.signUpSheet} />
                        </div>
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-brand-muted mb-2">
                            Comments
                          </p>
                          <SmartCell raw={room.comments} />
                        </div>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
