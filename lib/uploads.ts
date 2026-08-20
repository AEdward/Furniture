import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

const MAX_BYTES = 5 * 1024 * 1024; // 5MB

// Shared by every image upload on the site (product photos, variant
// images, hero image, bank transfer receipts, etc.) — re-encoding here
// covers all of them, no separate CDN account needed. Longest side
// capped at 1600px (well past any size actually displayed) and
// re-encoded to web-quality WebP, which is usually a large size cut
// over the original JPG/PNG with no visible quality loss. Transparent
// PNGs (icons/logos, product photos with a cutout background) skip
// re-encoding to WebP-with-flattened-background and are just resized
// in their original format, so transparency isn't lost.
async function optimizeImage(
  buffer: Buffer,
  mimeType: string
): Promise<{ buffer: Buffer; ext: string }> {
  const image = sharp(buffer, { failOn: "none" }).rotate();
  const metadata = await image.metadata();
  const resized = image.resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true });

  if (mimeType === "image/png" && metadata.hasAlpha) {
    return { buffer: await resized.png({ compressionLevel: 9 }).toBuffer(), ext: "png" };
  }
  return { buffer: await resized.webp({ quality: 82 }).toBuffer(), ext: "webp" };
}

export type SaveImageUploadResult = { url: string } | { error: string; status: number };

export async function saveImageUpload(file: File): Promise<SaveImageUploadResult> {
  const ext = ALLOWED_TYPES[file.type];
  if (!ext) {
    return { error: "Only JPG, PNG, and WEBP images are allowed.", status: 400 };
  }
  if (file.size > MAX_BYTES) {
    return { error: "Image must be 5MB or smaller.", status: 400 };
  }

  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadsDir, { recursive: true });

  const rawBuffer = Buffer.from(await file.arrayBuffer());
  let buffer: Buffer;
  let finalExt: string;
  try {
    const optimized = await optimizeImage(rawBuffer, file.type);
    buffer = optimized.buffer;
    finalExt = optimized.ext;
  } catch (err) {
    // Corrupt/unreadable image data, or an environment without sharp's
    // native binary available — fall back to storing the original file
    // unmodified rather than failing the upload outright.
    console.error("[upload] Image optimization failed, storing original:", err);
    buffer = rawBuffer;
    finalExt = ext;
  }

  const filename = `${randomUUID()}.${finalExt}`;
  await writeFile(path.join(uploadsDir, filename), buffer);

  return { url: `/uploads/${filename}` };
}
