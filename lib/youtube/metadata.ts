import { parseYouTubeDurationToSeconds } from "@/lib/youtube/utils";

export type YouTubeVideoMetadata = {
  title: string;
  channelTitle: string | null;
  description: string | null;
  thumbnailUrl: string | null;
  durationSeconds: number | null;
  publishedAt: string | null;
};

type YouTubeVideosResponse = {
  items?: Array<{
    snippet?: {
      title?: string;
      channelTitle?: string;
      description?: string;
      publishedAt?: string;
      thumbnails?: Record<string, { url?: string }>;
    };
    contentDetails?: {
      duration?: string;
    };
  }>;
  error?: {
    message?: string;
  };
};

export async function fetchYouTubeVideoMetadata(
  videoId: string,
): Promise<
  | { ok: true; metadata: YouTubeVideoMetadata }
  | { ok: false; message: string }
> {
  const apiKey = process.env.YOUTUBE_API_KEY;

  if (!apiKey) {
    return {
      ok: false,
      message: "YOUTUBE_API_KEY is not configured. Fill metadata manually.",
    };
  }

  const params = new URLSearchParams({
    part: "snippet,contentDetails",
    id: videoId,
    key: apiKey,
  });

  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?${params.toString()}`,
      { next: { revalidate: 60 * 60 } },
    );

    const payload = (await response.json()) as YouTubeVideosResponse;

    if (!response.ok) {
      return {
        ok: false,
        message: payload.error?.message ?? "YouTube metadata request failed.",
      };
    }

    const item = payload.items?.[0];
    if (!item?.snippet) {
      return { ok: false, message: "Video was not found on YouTube." };
    }

    const duration = item.contentDetails?.duration;
    const thumbnails = item.snippet.thumbnails ?? {};

    return {
      ok: true,
      metadata: {
        title: item.snippet.title ?? "Untitled podcast",
        channelTitle: item.snippet.channelTitle ?? null,
        description: item.snippet.description ?? null,
        publishedAt: item.snippet.publishedAt ?? null,
        thumbnailUrl:
          thumbnails.maxres?.url ??
          thumbnails.standard?.url ??
          thumbnails.high?.url ??
          thumbnails.medium?.url ??
          thumbnails.default?.url ??
          null,
        durationSeconds: duration
          ? parseYouTubeDurationToSeconds(duration)
          : null,
      },
    };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : "Unable to fetch YouTube metadata.",
    };
  }
}
