import { Link } from "@tanstack/react-router";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 w-full bg-brand-bg/95 backdrop-blur-md border-b border-zinc-200/60">
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link to="/" className="font-serif italic text-2xl tracking-tight shrink-0 text-brand-fg">
            CourtLinks
          </Link>
          <nav className="hidden md:flex gap-6">
            <Link
              to="/"
              activeOptions={{ exact: true }}
              className="text-sm font-medium text-brand-muted hover:text-brand-fg transition-colors"
              activeProps={{ className: "text-sm font-medium text-brand-fg" }}
            >
              Courthouses
            </Link>
            <Link
              to="/contact"
              className="text-sm font-medium text-brand-muted hover:text-brand-fg transition-colors"
              activeProps={{ className: "text-sm font-medium text-brand-fg" }}
            >
              Contact
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-zinc-200/60 bg-zinc-50/50">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row justify-between gap-12">
          <div className="max-w-sm">
            <Link to="/" className="font-serif italic text-2xl tracking-tight mb-4 block text-brand-fg">
              CourtLinks
            </Link>
            <p className="text-sm text-brand-muted leading-relaxed text-pretty">
              An independent guide to Ontario Court of Justice and Superior Court of Justice
              facilities. Data is synced live from a public registry.
            </p>
          </div>
          <div className="flex gap-16">
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-widest text-brand-muted mb-4">
                Site
              </h4>
              <ul className="space-y-2">
                <li>
                  <Link to="/contact" className="text-sm text-brand-fg hover:underline decoration-zinc-300">
                    Contact us
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-widest text-brand-muted mb-4">
                Resources
              </h4>
              <ul className="space-y-2">
                <li>
                  <a
                    href="https://www.legalaid.on.ca"
                    target="_blank"
                    rel="noreferrer noopener"
                    className="text-sm text-brand-fg hover:underline decoration-zinc-300"
                  >
                    Legal Aid Ontario
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.ontariocourts.ca"
                    target="_blank"
                    rel="noreferrer noopener"
                    className="text-sm text-brand-fg hover:underline decoration-zinc-300"
                  >
                    Ontario Courts
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-zinc-200/40 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <p className="text-xs text-brand-muted">
            &copy; {new Date().getFullYear()} CourtLinks Registry. Not a government agency.
          </p>
          <div className="flex items-center gap-2">
            <div className="size-1.5 rounded-full bg-emerald-500" />
            <span className="text-[10px] font-medium uppercase tracking-widest text-brand-muted">
              Live from public registry
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
