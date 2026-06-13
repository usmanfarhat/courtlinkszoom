import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { getCourthouses } from "@/lib/courthouses.functions";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";

const courthousesQuery = queryOptions({
  queryKey: ["courthouses"],
  queryFn: () => getCourthouses({ data: {} }),
});

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CourtDir — Ontario Courthouse Directory" },
      {
        name: "description",
        content:
          "Browse Ontario courthouses and look up courtroom Zoom links, dial-in numbers, and sign-up sheets.",
      },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(courthousesQuery),
  component: HomePage,
  errorComponent: ({ error }) => (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <h1 className="font-serif text-3xl mb-2">Couldn't load the registry</h1>
        <p className="text-brand-muted text-sm">{error.message}</p>
      </div>
    </div>
  ),
});

function HomePage() {
  const { data: courthouses } = useSuspenseQuery(courthousesQuery);
  const router = useRouter();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return courthouses;
    return courthouses.filter((c) => c.name.toLowerCase().includes(q));
  }, [courthouses, query]);

  const totalCourtrooms = courthouses.reduce((sum, c) => sum + c.courtrooms.length, 0);

  return (
    <>
      <SiteHeader />
      <main className="py-12">
        <section className="max-w-7xl mx-auto px-6 mb-16">
          <div className="max-w-3xl">
            <h1 className="text-5xl md:text-6xl font-serif leading-tight text-balance mb-6">
              Courtrooms &amp; Resources
            </h1>
            <p className="text-lg text-brand-muted text-pretty max-w-[56ch]">
              A comprehensive directory of Ontario's judicial infrastructure. Access courtroom Zoom
              links, dial-in numbers, and sign-up sheets across {courthouses.length} courthouses and{" "}
              {totalCourtrooms} courtrooms.
            </p>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-6 mb-12">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (filtered.length === 1) {
                router.navigate({
                  to: "/courthouse/$slug",
                  params: { slug: filtered[0].slug },
                });
              }
            }}
            className="flex items-center gap-2 p-1 bg-zinc-100 rounded-lg ring-1 ring-black/5"
          >
            <div className="pl-3 text-brand-muted">
              <Search className="size-4" />
            </div>
            <input
              id="global-search"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filter by city or courthouse..."
              className="flex-1 h-12 px-2 bg-transparent border-none outline-none text-base text-brand-fg placeholder:text-zinc-400"
            />
          </form>
        </section>

        <section className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-zinc-200/60">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-brand-muted">
              Regional Jurisdictions
            </h2>
            <span className="text-sm text-brand-muted">
              {courthouses.length} locations
            </span>
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-20 text-brand-muted">
              <p className="font-serif text-2xl mb-2">No matches</p>
              <p className="text-sm">Try a different city name.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-px bg-zinc-200 ring-1 ring-black/5 overflow-hidden rounded-lg">
              {filtered.map((c) => (
                <Link
                  key={c.slug}
                  to="/courthouse/$slug"
                  params={{ slug: c.slug }}
                  className="group bg-brand-bg p-6 hover:bg-zinc-50 transition-colors flex flex-col"
                >
                  <div className="flex justify-between items-start gap-3 mb-12">
                    <h3 className="text-lg font-medium leading-tight text-brand-fg capitalize">
                      {c.name.toLowerCase()}
                    </h3>
                    <span className="px-2 py-0.5 bg-zinc-100 text-[11px] font-semibold text-brand-muted rounded-full ring-1 ring-black/5 uppercase whitespace-nowrap">
                      {c.courtrooms.length} {c.courtrooms.length === 1 ? "court" : "courts"}
                    </span>
                  </div>
                  <p className="text-xs text-brand-muted uppercase tracking-wider mt-auto">
                    View courtrooms →
                  </p>
                </Link>
              ))}
            </div>
          )}
        </section>

        <section className="max-w-7xl mx-auto px-6 mt-12">
          <div className="w-full h-32 bg-zinc-100/50 outline outline-1 -outline-offset-1 outline-black/5 rounded-lg grid place-items-center">
            <div className="text-center">
              <span className="block text-[10px] font-medium uppercase tracking-[0.2em] text-zinc-400 mb-2">
                Advertisement
              </span>
              <span className="text-sm text-zinc-500 font-serif">
                Your message here — replace this with your ad code.
              </span>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
