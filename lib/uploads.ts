import "server-only";
import fs from "node:fs";
import path from "node:path";

const MAX_FILE_SIZE_BYTES = 3 * 1024 * 1024;

export function getUploadsDirectory(): string {
  const resolved = path.join(process.cwd(), "data", "uploads");

  if (!fs.existsSync(resolved)) {
    fs.mkdirSync(resolved, { recursive: true });
  }
  return resolved;
}

function detectImageExtension(buffer: Buffer): "jpg" | "png" | "webp" | null {
  if (buffer.length < 12) return null;

  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return "jpg";
  }

  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47
  ) {
    return "png";
  }

  const riff = buffer.subarray(0, 4).toString("ascii");
  const webp = buffer.subarray(8, 12).toString("ascii");
  if (riff === "RIFF" && webp === "WEBP") {
    return "webp";
  }

  return null;
}

export async function saveUploadedCover(
  file: File | null | undefined,
  bookSlugOrPrefix = "cover"
): Promise<{ ok: true; coverPath: string | null } | { ok: false; error: string }> {
  if (!file || file.size === 0) {
    return { ok: true, coverPath: null };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      ok: false,
      error: "Ukuran file sampul melebihi batas maksimal 3 MB.",
    };
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const ext = detectImageExtension(buffer);
  if (!ext) {
    return {
      ok: false,
      error:
        "Format gambar tidak valid. Gunakan file JPG, PNG, atau WebP asli.",
    };
  }

  const safePrefix = bookSlugOrPrefix
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 40);

  const uniqueName = `${safePrefix}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 7)}.${ext}`;

  const uploadsDir = getUploadsDirectory();
  const fullPath = path.join(uploadsDir, uniqueName);
  fs.writeFileSync(fullPath, buffer);

  return {
    ok: true,
    coverPath: `/api/uploads/${uniqueName}`,
  };
}

export function deleteUploadedCover(
  coverPath: string | null | undefined
): void {
  if (!coverPath || !coverPath.startsWith("/api/uploads/")) return;
  const fileName = path.basename(coverPath.replace("/api/uploads/", ""));
  if (!fileName) return;
  const fullPath = path.join(getUploadsDirectory(), fileName);
  try {
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
  } catch {
  }
}