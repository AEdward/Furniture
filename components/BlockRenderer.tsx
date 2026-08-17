import Image from "next/image";
import Link from "next/link";
import type { PageBlock } from "@/lib/pages";

function Paragraphs({ text, className }: { text: string; className?: string }) {
  const paragraphs = text.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
  return (
    <div className={className}>
      {paragraphs.map((p, i) => (
        <p key={i} className={i > 0 ? "mt-4" : undefined}>
          {p}
        </p>
      ))}
    </div>
  );
}

export default function BlockRenderer({ blocks }: { blocks: PageBlock[] }) {
  return (
    <>
      {blocks.map((block, i) => {
        switch (block.type) {
          case "hero":
            return (
              <section
                key={i}
                className="border-b border-walnut-100 bg-gradient-to-b from-sand to-cream"
              >
                <div className="container-shop grid gap-10 py-16 md:grid-cols-2 md:items-center md:py-24">
                  <div>
                    <h1 className="font-serif text-4xl font-semibold leading-tight text-ink sm:text-5xl">
                      {block.heading}
                    </h1>
                    {block.subheading && (
                      <p className="mt-5 max-w-md text-base leading-relaxed text-ink/70">
                        {block.subheading}
                      </p>
                    )}
                    {block.ctaLabel && block.ctaHref && (
                      <Link href={block.ctaHref} className="btn-primary mt-8 inline-flex">
                        {block.ctaLabel}
                      </Link>
                    )}
                  </div>
                  {block.imageUrl && (
                    <div className="relative aspect-square overflow-hidden rounded-2xl">
                      <Image
                        src={block.imageUrl}
                        alt=""
                        fill
                        sizes="(min-width: 768px) 50vw, 100vw"
                        className="object-cover"
                      />
                    </div>
                  )}
                </div>
              </section>
            );

          case "richtext":
            return (
              <section key={i} className="container-shop py-14">
                <div className="mx-auto max-w-2xl">
                  {block.heading && (
                    <h2 className="mb-4 font-serif text-2xl font-semibold text-ink">
                      {block.heading}
                    </h2>
                  )}
                  <Paragraphs
                    text={block.body}
                    className="space-y-4 text-base leading-relaxed text-ink/70"
                  />
                </div>
              </section>
            );

          case "imagetext":
            return (
              <section key={i} className="container-shop py-14">
                <div
                  className={`grid items-center gap-10 md:grid-cols-2 ${
                    block.imagePosition === "right" ? "" : ""
                  }`}
                >
                  <div className={block.imagePosition === "right" ? "md:order-1" : "md:order-2"}>
                    {block.heading && (
                      <h2 className="mb-4 font-serif text-2xl font-semibold text-ink">
                        {block.heading}
                      </h2>
                    )}
                    <Paragraphs
                      text={block.body}
                      className="space-y-4 text-base leading-relaxed text-ink/70"
                    />
                  </div>
                  <div
                    className={`relative aspect-[4/3] overflow-hidden rounded-2xl bg-walnut-50 ${
                      block.imagePosition === "right" ? "md:order-2" : "md:order-1"
                    }`}
                  >
                    {block.imageUrl && (
                      <Image
                        src={block.imageUrl}
                        alt=""
                        fill
                        sizes="(min-width: 768px) 50vw, 100vw"
                        className="object-cover"
                      />
                    )}
                  </div>
                </div>
              </section>
            );

          default:
            return null;
        }
      })}
    </>
  );
}
