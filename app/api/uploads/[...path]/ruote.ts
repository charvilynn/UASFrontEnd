import { NextRequest, NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";
import { getUploadsDirectory } from "@/lib/uploads";

const MIME_MAP: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const { path: pathSegments } = await context.params;
  if (!pathSegments || pathSegments.length === 0) {
    return new NextResponse("File tidak ditemukan", { status: 404 });
  }

  const fileName = path.basename(pathSegments.join("/"));
  const uploadsDir = getUploadsDirectory();
  const targetFile = path.resolve(uploadsDir, fileName);

  if (!targetFile.startsWith(uploadsDir) || !fs.existsSync(targetFile)) {
    return new NextResponse("Sampul tidak ditemukan", { status: 404 });
  }

  const ext = path.extname(targetFile).toLowerCase();
  const contentType = MIME_MAP[ext] || "application/octet-stream";
  const fileBuffer = fs.readFileSync(targetFile);

  return new NextResponse(fileBuffer, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}