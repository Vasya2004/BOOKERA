import { NextResponse } from "next/server";
import { fetchYouTubeVideoMetadata } from "@/lib/youtube/metadata";
import { extractYouTubeVideoId } from "@/lib/youtube/utils";
import { requireUser } from "@/server/actions/auth-helpers";

export async function GET(request: Request) {
  await requireUser();
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url") ?? "";
  const videoId = extractYouTubeVideoId(url);

  if (!videoId) {
    return NextResponse.json(
      { ok: false, message: "Не удалось извлечь videoId из ссылки." },
      { status: 400 },
    );
  }

  const result = await fetchYouTubeVideoMetadata(videoId);
  return NextResponse.json(result, { status: result.ok ? 200 : 400 });
}
