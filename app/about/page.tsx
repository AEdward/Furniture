import type { Metadata } from "next";
import FurnitureIcon from "@/components/FurnitureIcon";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = { title: "About" };

const values = [
  {
    title: "Solid materials",
    body: "Real wood, real weave, real metal. No particleboard shortcuts where it matters.",
  },
  {
    title: "Honest pricing",
    body: "One markup, not three. What you pay reflects what the piece actually costs to make.",
  },
  {
    title: "Built to last",
    body: "Every piece is designed to be repaired, not replaced, when something eventually wears.",
  },
];

export default function AboutPage() {
  return (
    <div>
      <section className="border-b border-walnut-100 bg-gradient-to-b from-sand to-cream">
        <div className="container-shop py-16 text-center md:py-24">
          <p className="section-label">Our story</p>
          <h1 className="mx-auto mt-3 max-w-2xl font-serif text-4xl font-semibold leading-tight text-ink sm:text-5xl">
            [Placeholder] — this is where {siteConfig.name}&apos;s real story
            goes.
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-ink/70">
            Replace this paragraph with the company&apos;s actual founding
            story, mission, and what makes their approach to furniture
            different. Two or three sentences is usually enough.
          </p>
        </div>
      </section>

      <section className="container-shop py-16">
        <div className="grid gap-8 sm:grid-cols-3">
          {values.map((v) => (
            <div key={v.title} className="rounded-2xl border border-walnut-100 p-6">
              <h3 className="font-serif text-lg font-semibold text-ink">
                {v.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ink/70">{v.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-walnut-50/60 py-16">
        <div className="container-shop grid items-center gap-10 md:grid-cols-2">
          <div className="flex aspect-[4/3] items-center justify-center rounded-2xl bg-gradient-to-br from-walnut-100 to-terracotta-100">
            <FurnitureIcon
              name="armchair"
              className="h-32 w-32 text-walnut-500/70"
            />
          </div>
          <div>
            <p className="section-label">The workshop</p>
            <h2 className="mt-2 font-serif text-3xl font-semibold text-ink">
              [Placeholder] Where it's made
            </h2>
            <p className="mt-4 text-base leading-relaxed text-ink/70">
              Swap this section for real photos and copy about the
              workshop, materials sourcing, or manufacturing partners —
              whatever best explains how the furniture actually gets made.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
