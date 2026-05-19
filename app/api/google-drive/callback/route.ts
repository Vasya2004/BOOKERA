import { NextResponse } from "next/server";
import { handleGoogleDriveCallback } from "@/server/actions/google-drive";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const oauthError = url.searchParams.get("error");

  if (oauthError) {
    return NextResponse.redirect(
      new URL(`/settings?drive=error&reason=${encodeURIComponent(oauthError)}`, url.origin),
    );
  }

  if (!code || !state) {
    return NextResponse.redirect(
      new URL("/settings?drive=error&reason=missing_oauth_params", url.origin),
    );
  }

  try {
    await handleGoogleDriveCallback(code, state);
    return NextResponse.redirect(new URL("/settings?drive=connected", url.origin));
  } catch (error) {
    const message = error instanceof Error ? error.message : "oauth_callback_failed";
    return NextResponse.redirect(
      new URL(`/settings?drive=error&reason=${encodeURIComponent(message)}`, url.origin),
    );
  }
}
