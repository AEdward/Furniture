"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ImageUpload from "@/components/ImageUpload";
import { slugify } from "@/lib/products";
import type { Page } from "@/lib/db";
import {
  BLOCK_TYPE_LABELS,
  emptyBlock,
  type HeroBlock,
  type ImageTextBlock,
  type PageBlock,
  type RichTextBlock,
} from "@/lib/pages";

type Props = {
  mode: "create" | "edit";
  initial?: Page;
};

const inputClass =
  "rounded-lg border border-walnut-200 px-3 py-2.5 focus:border-walnut-400 focus:outline-none";
const labelClass = "flex flex-col gap-1.5 text-sm";

function HeroFields({
  block,
  onChange,
}: {
  block: HeroBlock;
  onChange: (b: HeroBlock) => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <ImageUpload
        value={block.imageUrl}
        onChange={(imageUrl) => onChange({ ...block, imageUrl })}
        label="Image (optional)"
      />
      <label className={labelClass}>
        Heading
        <input
          required
          value={block.heading}
          onChange={(e) => onChange({ ...block, heading: e.target.value })}
          className={inputClass}
        />
      </label>
      <label className={labelClass}>
        Subheading
        <textarea
          rows={2}
          value={block.subheading}
          onChange={(e) => onChange({ ...block, subheading: e.target.value })}
          className={`${inputClass} resize-none`}
        />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className={labelClass}>
          Button label (optional)
          <input
            value={block.ctaLabel ?? ""}
            onChange={(e) => onChange({ ...block, ctaLabel: e.target.value || null })}
            className={inputClass}
          />
        </label>
        <label className={labelClass}>
          Button link (optional)
          <input
            value={block.ctaHref ?? ""}
            onChange={(e) => onChange({ ...block, ctaHref: e.target.value || null })}
            placeholder="/shop"
            className={inputClass}
          />
        </label>
      </div>
    </div>
  );
}

function RichTextFields({
  block,
  onChange,
}: {
  block: RichTextBlock;
  onChange: (b: RichTextBlock) => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <label className={labelClass}>
        Heading (optional)
        <input
          value={block.heading ?? ""}
          onChange={(e) => onChange({ ...block, heading: e.target.value || null })}
          className={inputClass}
        />
      </label>
      <label className={labelClass}>
        Body — separate paragraphs with a blank line
        <textarea
          required
          rows={6}
          value={block.body}
          onChange={(e) => onChange({ ...block, body: e.target.value })}
          className={`${inputClass} resize-none`}
        />
      </label>
    </div>
  );
}

function ImageTextFields({
  block,
  onChange,
}: {
  block: ImageTextBlock;
  onChange: (b: ImageTextBlock) => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <ImageUpload
        value={block.imageUrl}
        onChange={(imageUrl) => onChange({ ...block, imageUrl })}
        label="Image"
      />
      <label className={labelClass}>
        Heading (optional)
        <input
          value={block.heading ?? ""}
          onChange={(e) => onChange({ ...block, heading: e.target.value || null })}
          className={inputClass}
        />
      </label>
      <label className={labelClass}>
        Body — separate paragraphs with a blank line
        <textarea
          required
          rows={4}
          value={block.body}
          onChange={(e) => onChange({ ...block, body: e.target.value })}
          className={`${inputClass} resize-none`}
        />
      </label>
      <label className={labelClass}>
        Image position
        <select
          value={block.imagePosition}
          onChange={(e) =>
            onChange({ ...block, imagePosition: e.target.value as "left" | "right" })
          }
          className={inputClass}
        >
          <option value="left">Left</option>
          <option value="right">Right</option>
        </select>
      </label>
    </div>
  );
}

export default function PageBlockEditor({ mode, initial }: Props) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState(initial?.title ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(mode === "edit");
  const [metaDescription, setMetaDescription] = useState(initial?.metaDescription ?? "");
  const [showInNav, setShowInNav] = useState(initial?.showInNav ?? false);
  const [navLabel, setNavLabel] = useState(initial?.navLabel ?? "");
  const [navOrder, setNavOrder] = useState(String(initial?.navOrder ?? 0));
  const [blocks, setBlocks] = useState<PageBlock[]>(initial?.blocks ?? []);

  function updateBlock(index: number, next: PageBlock) {
    setBlocks((prev) => prev.map((b, i) => (i === index ? next : b)));
  }

  function removeBlock(index: number) {
    setBlocks((prev) => prev.filter((_, i) => i !== index));
  }

  function moveBlock(index: number, dir: -1 | 1) {
    setBlocks((prev) => {
      const next = [...prev];
      const target = index + dir;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  function addBlock(type: PageBlock["type"]) {
    setBlocks((prev) => [...prev, emptyBlock(type)]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const body = {
      title,
      slug: slugTouched ? slug : slugify(title),
      metaDescription: metaDescription || null,
      showInNav,
      navLabel: navLabel || null,
      navOrder: Number(navOrder) || 0,
      blocks,
    };

    try {
      const res = await fetch(
        mode === "create" ? "/api/admin/pages" : `/api/admin/pages/${initial!.slug}`,
        {
          method: mode === "create" ? "POST" : "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        setSubmitting(false);
        return;
      }
      router.push("/portal2026/pages");
      router.refresh();
    } catch {
      setError("Network error — please try again.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 rounded-2xl border border-walnut-100 bg-white/60 p-6">
        <h2 className="font-serif text-base font-semibold text-ink">Page details</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className={labelClass}>
            Title
            <input
              required
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (!slugTouched) setSlug(slugify(e.target.value));
              }}
              className={inputClass}
            />
          </label>
          <label className={labelClass}>
            URL — yoursite.com/<span className="font-mono">{slug || "…"}</span>
            <input
              required
              value={slug}
              onChange={(e) => {
                setSlugTouched(true);
                setSlug(e.target.value);
              }}
              className={`${inputClass} font-mono text-xs`}
            />
          </label>
          <label className={`${labelClass} sm:col-span-2`}>
            Meta description (optional, for search engines)
            <input
              value={metaDescription}
              onChange={(e) => setMetaDescription(e.target.value)}
              className={inputClass}
            />
          </label>
        </div>

        <div className="flex flex-wrap items-end gap-4 border-t border-walnut-100 pt-4">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={showInNav} onChange={(e) => setShowInNav(e.target.checked)} />
            Show in header navigation
          </label>
          {showInNav && (
            <>
              <label className={labelClass}>
                Nav label
                <input
                  value={navLabel}
                  onChange={(e) => setNavLabel(e.target.value)}
                  placeholder={title}
                  className={inputClass}
                />
              </label>
              <label className={labelClass}>
                Nav order
                <input
                  type="number"
                  value={navOrder}
                  onChange={(e) => setNavOrder(e.target.value)}
                  className={`${inputClass} w-24`}
                />
              </label>
            </>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {blocks.map((block, i) => (
          <div key={i} className="flex flex-col gap-4 rounded-2xl border border-walnut-100 bg-white/60 p-6">
            <div className="flex items-center justify-between border-b border-walnut-100 pb-3">
              <span className="text-xs font-semibold uppercase tracking-wide text-terracotta-400">
                {BLOCK_TYPE_LABELS[block.type]}
              </span>
              <div className="flex items-center gap-3 text-sm">
                <button type="button" onClick={() => moveBlock(i, -1)} disabled={i === 0} className="text-ink/60 hover:text-walnut-600 disabled:opacity-30">
                  ↑
                </button>
                <button type="button" onClick={() => moveBlock(i, 1)} disabled={i === blocks.length - 1} className="text-ink/60 hover:text-walnut-600 disabled:opacity-30">
                  ↓
                </button>
                <button type="button" onClick={() => removeBlock(i)} className="text-danger-500 hover:underline">
                  Remove
                </button>
              </div>
            </div>

            {block.type === "hero" && (
              <HeroFields block={block} onChange={(b) => updateBlock(i, b)} />
            )}
            {block.type === "richtext" && (
              <RichTextFields block={block} onChange={(b) => updateBlock(i, b)} />
            )}
            {block.type === "imagetext" && (
              <ImageTextFields block={block} onChange={(b) => updateBlock(i, b)} />
            )}
          </div>
        ))}

        <div className="flex flex-wrap gap-3 rounded-2xl border border-dashed border-walnut-300 bg-walnut-50/40 p-6">
          <span className="w-full text-sm font-medium text-ink/60">Add a section:</span>
          <button type="button" onClick={() => addBlock("hero")} className="btn-secondary !px-4 !py-2 text-sm">
            + Hero
          </button>
          <button type="button" onClick={() => addBlock("richtext")} className="btn-secondary !px-4 !py-2 text-sm">
            + Text
          </button>
          <button type="button" onClick={() => addBlock("imagetext")} className="btn-secondary !px-4 !py-2 text-sm">
            + Image + Text
          </button>
        </div>
      </div>

      {error && (
        <p className="rounded-lg bg-danger-50 px-4 py-3 text-sm text-danger-500">{error}</p>
      )}

      <div className="flex gap-3">
        <button type="submit" disabled={submitting} className="btn-primary">
          {submitting ? "Saving…" : mode === "create" ? "Create page" : "Save changes"}
        </button>
        <button type="button" onClick={() => router.push("/portal2026/pages")} className="btn-secondary">
          Cancel
        </button>
      </div>
    </form>
  );
}
