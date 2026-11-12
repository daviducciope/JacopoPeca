import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function getPublicUrl(bucket: string, region: string, key: string) {
  const assetBaseUrl = process.env.NEXT_PUBLIC_ASSET_BASE_URL?.replace(/\/$/, "");
  if (assetBaseUrl) {
    return `${assetBaseUrl}/${key}`;
  }
  return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
}

function sanitizeExtension(filename: string, contentType: string) {
  const ext = path.extname(filename).toLowerCase();
  if ([".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif", ".mp4", ".mov", ".webm", ".m4v", ".3gp"].includes(ext)) {
    return ext === ".jpeg" ? ".jpg" : ext;
  }
  if (contentType.startsWith("video/")) {
    return contentType.includes("quicktime") ? ".mov" : contentType.includes("webm") ? ".webm" : ".mp4";
  }
  if (contentType.includes("png")) return ".png";
  if (contentType.includes("webp")) return ".webp";
  if (contentType.includes("gif")) return ".gif";
  if (contentType.includes("avif")) return ".avif";
  return ".jpg";
}

export async function POST(request: Request) {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Formato richiesta upload non valido." }, { status: 400 });
  }

  const file = formData.get("file");
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "Nessun file immagine ricevuto." }, { status: 400 });
  }

  const isVideo = (file.type || "").startsWith("video/");
  const maxBytes = isVideo ? 100 * 1024 * 1024 : 25 * 1024 * 1024;
  if (file.size <= 0 || file.size > maxBytes) {
    return NextResponse.json(
      { error: `Il file supera il limite massimo di ${isVideo ? 100 : 25} MB.` },
      { status: 400 },
    );
  }

  const contentType = file.type || "image/jpeg";
  const extension = sanitizeExtension(file.name || "photo.jpg", contentType);
  const year = new Date().getUTCFullYear();
  const filename = `${randomUUID()}${extension}`;
  const key = `${isVideo ? "products/videos" : "products"}/${year}/${filename}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const region = process.env.AWS_REGION;
  const bucket = process.env.AWS_S3_BUCKET;

  if (region && bucket && process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
    try {
      const client = new S3Client({ region, requestChecksumCalculation: "WHEN_REQUIRED" });
      await client.send(
        new PutObjectCommand({
          Bucket: bucket,
          Key: key,
          Body: buffer,
          ContentType: contentType,
          CacheControl: "public, max-age=31536000, immutable",
        }),
      );

      return NextResponse.json({
        publicUrl: getPublicUrl(bucket, region, key),
        key,
      });
    } catch (error) {
      console.error("S3 direct upload failed, falling back to local storage:", error);
    }
  }

  // Fallback: save locally in public/uploads/products/<year>/
  try {
    const relativeDir = path.join("uploads", "products", ...(isVideo ? ["videos"] : []), String(year));
    const publicDir = path.join(process.cwd(), "public", relativeDir);
    await mkdir(publicDir, { recursive: true });
    const filePath = path.join(publicDir, filename);
    await writeFile(filePath, buffer);

    return NextResponse.json({
      publicUrl: `/uploads/products/${isVideo ? "videos/" : ""}${year}/${filename}`,
      key: `uploads/products/${isVideo ? "videos/" : ""}${year}/${filename}`,
    });
  } catch (error) {
    console.error("Local file upload failed:", error);
    return NextResponse.json(
      { error: "Impossibile salvare il file immagine sul server." },
      { status: 500 },
    );
  }
}
