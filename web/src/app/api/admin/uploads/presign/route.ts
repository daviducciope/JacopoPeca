import { randomUUID } from "node:crypto";
import path from "node:path";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { NextResponse } from "next/server";
import { z } from "zod";

export const dynamic = "force-dynamic";

const uploadSchema = z.object({
  filename: z.string().trim().min(1).max(180),
  contentType: z.string().trim().regex(/^image\/(jpeg|png|webp|gif|avif)$/),
  size: z.number().int().positive().max(12 * 1024 * 1024),
});

function getPublicUrl(bucket: string, region: string, key: string) {
  const assetBaseUrl = process.env.NEXT_PUBLIC_ASSET_BASE_URL?.replace(/\/$/, "");
  if (assetBaseUrl) {
    return `${assetBaseUrl}/${key}`;
  }

  return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
}

function sanitizeExtension(filename: string) {
  const ext = path.extname(filename).toLowerCase();
  if ([".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"].includes(ext)) {
    return ext;
  }

  return ".jpg";
}

export async function POST(request: Request) {
  const region = process.env.AWS_REGION;
  const bucket = process.env.AWS_S3_BUCKET;

  if (!region || !bucket || !process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
    return NextResponse.json(
      { error: "Upload S3 non configurato. Verifica AWS_REGION, AWS_S3_BUCKET e credenziali AWS." },
      { status: 503 },
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Payload upload non valido." }, { status: 400 });
  }

  const result = uploadSchema.safeParse(payload);
  if (!result.success) {
    return NextResponse.json({ error: "File immagine non valido.", details: result.error.flatten() }, { status: 400 });
  }

  const extension = sanitizeExtension(result.data.filename);
  const key = `products/${new Date().getUTCFullYear()}/${randomUUID()}${extension}`;
  // requestChecksumCalculation: WHEN_REQUIRED prevents the SDK from adding
  // x-amz-checksum-crc32 to presigned URLs — that header makes browser PUTs
  // fail because the browser can't compute or forward the checksum.
  const client = new S3Client({ region, requestChecksumCalculation: "WHEN_REQUIRED" });
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    ContentType: result.data.contentType,
    CacheControl: "public, max-age=31536000, immutable",
  });

  const uploadUrl = await getSignedUrl(client, command, { expiresIn: 300 });

  return NextResponse.json({
    uploadUrl,
    publicUrl: getPublicUrl(bucket, region, key),
    key,
  });
}
