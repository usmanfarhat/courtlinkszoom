import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { ContactForm } from "@/components/contact-form";

const searchSchema = z.object({
  courthouse: z.string().optional(),
  subject: z.string().optional(),
});

export const Route = createFileRoute("/contact")({
  validateSearch: (s) => searchSchema.parse(s),
  head: () => ({
    meta: [
      { title: "Contact — CourtLinks" },
      {
        name: "description",
        content:
          "Get in touch with CourtLinks. Report missing or incorrect courthouse data, or ask a question.",
      },
      { property: "og:title", content: "Contact — CourtLinks" },
      {
        property: "og:description",
        content: "Reach the CourtLinks team to report data issues or ask a question.",
      },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const { courthouse, subject } = Route.useSearch();
  const prettyCourthouse = courthouse
    ? courthouse.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
    : "";
  const defaultSubject =
    subject ?? (prettyCourthouse ? `Data correction: ${prettyCourthouse}` : "");
  const defaultMessage = prettyCourthouse
    ? `Hi CourtLinks team,\n\nI'd like to report a data issue for ${prettyCourthouse}:\n\n• What's wrong: \n• Correct info: \n\nThanks!`
    : "";

  return (
    <>
      <SiteHeader />
      <main className="py-12">
        <section className="max-w-3xl mx-auto px-6 mb-10">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-brand-muted mb-2">
            Contact
          </p>
          <h1 className="text-4xl md:text-5xl font-serif leading-tight text-balance mb-4">
            Get in touch
          </h1>
          <p className="text-brand-muted text-pretty max-w-[60ch]">
            Spotted a Zoom link that's out of date, a missing courthouse, or a phone
            number that no longer works? Let us know — we'll update the registry quickly.
            For anything else, just send a note.
          </p>
        </section>

        <section className="max-w-3xl mx-auto px-6">
          <div className="rounded-lg ring-1 ring-black/5 bg-white p-6">
            <ContactForm
              defaultSubject={defaultSubject}
              defaultMessage={defaultMessage}
              context={courthouse ? { Courthouse: prettyCourthouse } : undefined}
            />
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
