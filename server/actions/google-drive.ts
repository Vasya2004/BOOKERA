"use server";

import { randomBytes } from "crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getGoogleDriveEnv, hasGoogleDriveEnv } from "@/lib/google-drive/env";
import { requireUser } from "@/server/actions/auth-helpers";
import { failure, success, type ActionResult } from "@/server/actions/result";

const DRIVE_SCOPE = "https://www.googleapis.com/auth/drive.file";
const TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token";
const UPLOAD_ENDPOINT = "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart";
const OAUTH_STATE_COOKIE = "google_drive_oauth_state";

type ConnectionRow = {
  user_id: string;
  access_token: string;
  refresh_token: string;
  token_expires_at: string;
  last_synced_at: string | null;
};

function encodeState(payload: { userId: string; nonce: string }) {
  return Buffer.from(JSON.stringify(payload)).toString("base64url");
}

function decodeState(rawState: string): { userId: string; nonce: string } | null {
  try {
    const text = Buffer.from(rawState, "base64url").toString("utf8");
    const parsed = JSON.parse(text) as { userId?: string; nonce?: string };
    if (!parsed.userId || !parsed.nonce) {
      return null;
    }
    return { userId: parsed.userId, nonce: parsed.nonce };
  } catch {
    return null;
  }
}

async function getUserExportPayload(userId: string) {
  const { supabase } = await requireUser();
  const [podcasts, notes, tags, podcastTags, noteTags] = await Promise.all([
    supabase.from("podcasts").select("*").eq("user_id", userId),
    supabase.from("notes").select("*").eq("user_id", userId),
    supabase.from("tags").select("*").eq("user_id", userId),
    supabase.from("podcast_tags").select("*").eq("user_id", userId),
    supabase.from("note_tags").select("*").eq("user_id", userId),
  ]);

  const failed = [podcasts, notes, tags, podcastTags, noteTags].find((result) => result.error);
  if (failed?.error) {
    throw new Error(failed.error.message);
  }

  return {
    exportedAt: new Date().toISOString(),
    podcasts: podcasts.data,
    notes: notes.data,
    tags: tags.data,
    podcastTags: podcastTags.data,
    noteTags: noteTags.data,
  };
}

async function refreshAccessTokenIfNeeded(
  connection: ConnectionRow,
): Promise<{ accessToken: string; expiresAt: string }> {
  const now = Date.now();
  const expiresAtMs = new Date(connection.token_expires_at).getTime();
  if (expiresAtMs - now > 60_000) {
    return {
      accessToken: connection.access_token,
      expiresAt: connection.token_expires_at,
    };
  }

  const { clientId, clientSecret } = getGoogleDriveEnv();
  const response = await fetch(TOKEN_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: connection.refresh_token,
      grant_type: "refresh_token",
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Google token refresh failed: ${text}`);
  }

  const data = (await response.json()) as {
    access_token?: string;
    expires_in?: number;
  };

  if (!data.access_token || !data.expires_in) {
    throw new Error("Google token refresh response is incomplete.");
  }

  const expiresAt = new Date(Date.now() + data.expires_in * 1000).toISOString();
  const { supabase, user } = await requireUser();
  const { error } = await supabase
    .from("google_drive_connections")
    .update({
      access_token: data.access_token,
      token_expires_at: expiresAt,
    })
    .eq("user_id", user.id);

  if (error) {
    throw new Error(error.message);
  }

  return { accessToken: data.access_token, expiresAt };
}

export async function connectGoogleDrive(): Promise<void> {
  if (!hasGoogleDriveEnv()) {
    redirect("/settings?drive=error&reason=missing_google_drive_env");
  }

  const { user } = await requireUser();
  const nonce = randomBytes(16).toString("hex");
  const state = encodeState({ userId: user.id, nonce });
  const cookieStore = await cookies();
  cookieStore.set(OAUTH_STATE_COOKIE, state, {
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    path: "/",
    maxAge: 60 * 10,
  });

  const { clientId, redirectUri } = getGoogleDriveEnv();
  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", DRIVE_SCOPE);
  url.searchParams.set("access_type", "offline");
  url.searchParams.set("prompt", "consent");
  url.searchParams.set("state", state);

  redirect(url.toString());
}

export async function handleGoogleDriveCallback(code: string, rawState: string): Promise<void> {
  if (!hasGoogleDriveEnv()) {
    throw new Error("Google Drive env missing");
  }

  const state = decodeState(rawState);
  if (!state) {
    throw new Error("OAuth state is invalid");
  }
  const cookieStore = await cookies();
  const cookieState = cookieStore.get(OAUTH_STATE_COOKIE)?.value;
  if (!cookieState || cookieState !== rawState) {
    throw new Error("OAuth state verification failed");
  }
  cookieStore.delete(OAUTH_STATE_COOKIE);

  const { supabase, user } = await requireUser();
  if (state.userId !== user.id) {
    throw new Error("OAuth state does not match current user");
  }

  const { clientId, clientSecret, redirectUri } = getGoogleDriveEnv();
  const response = await fetch(TOKEN_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Google token exchange failed: ${text}`);
  }

  const data = (await response.json()) as {
    access_token?: string;
    refresh_token?: string;
    expires_in?: number;
  };

  if (!data.access_token || !data.refresh_token || !data.expires_in) {
    throw new Error("Google OAuth token response is incomplete.");
  }

  const expiresAt = new Date(Date.now() + data.expires_in * 1000).toISOString();
  const { error } = await supabase.from("google_drive_connections").upsert(
    {
      user_id: user.id,
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      token_expires_at: expiresAt,
    },
    { onConflict: "user_id" },
  );

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/settings");
}

export async function disconnectGoogleDrive(): Promise<ActionResult> {
  const { supabase, user } = await requireUser();
  const { error } = await supabase
    .from("google_drive_connections")
    .delete()
    .eq("user_id", user.id);

  if (error) {
    return failure(error.message);
  }

  revalidatePath("/settings");
  return success("Google Drive отключен.");
}

export async function syncToGoogleDrive(): Promise<ActionResult> {
  if (!hasGoogleDriveEnv()) {
    return failure("Google Drive не настроен на сервере.");
  }

  const { supabase, user } = await requireUser();
  const { data, error } = await supabase
    .from("google_drive_connections")
    .select("user_id, access_token, refresh_token, token_expires_at, last_synced_at")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    return failure(error.message);
  }

  const connection = data as ConnectionRow | null;
  if (!connection) {
    return failure("Сначала подключите Google Drive.");
  }

  try {
    const { accessToken } = await refreshAccessTokenIfNeeded(connection);
    const payload = await getUserExportPayload(user.id);
    const content = JSON.stringify(payload, null, 2);
    const boundary = `podcastera-${Date.now()}`;

    const metadata = {
      name: `podcastera-backup-${new Date().toISOString().slice(0, 19).replace(/:/g, "-")}.json`,
      mimeType: "application/json",
    };

    const body =
      `--${boundary}\r\n` +
      "Content-Type: application/json; charset=UTF-8\r\n\r\n" +
      `${JSON.stringify(metadata)}\r\n` +
      `--${boundary}\r\n` +
      "Content-Type: application/json\r\n\r\n" +
      `${content}\r\n` +
      `--${boundary}--`;

    const upload = await fetch(UPLOAD_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": `multipart/related; boundary=${boundary}`,
      },
      body,
    });

    if (!upload.ok) {
      const text = await upload.text();
      return failure(`Ошибка загрузки в Google Drive: ${text}`);
    }

    const now = new Date().toISOString();
    const { error: updateError } = await supabase
      .from("google_drive_connections")
      .update({ last_synced_at: now })
      .eq("user_id", user.id);

    if (updateError) {
      return failure(updateError.message);
    }

    revalidatePath("/settings");
    return success("Данные успешно синхронизированы с Google Drive.");
  } catch (err) {
    return failure(err instanceof Error ? err.message : "Не удалось синхронизировать данные.");
  }
}
