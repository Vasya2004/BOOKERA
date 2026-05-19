type GoogleDriveEnv = {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
};

export function hasGoogleDriveEnv() {
  return Boolean(
    process.env.GOOGLE_DRIVE_CLIENT_ID &&
      process.env.GOOGLE_DRIVE_CLIENT_SECRET &&
      process.env.GOOGLE_DRIVE_REDIRECT_URI,
  );
}

export function getGoogleDriveEnv(): GoogleDriveEnv {
  const clientId = process.env.GOOGLE_DRIVE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_DRIVE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_DRIVE_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error(
      "GOOGLE_DRIVE_CLIENT_ID, GOOGLE_DRIVE_CLIENT_SECRET and GOOGLE_DRIVE_REDIRECT_URI must be configured.",
    );
  }

  return { clientId, clientSecret, redirectUri };
}
