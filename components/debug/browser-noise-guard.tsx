"use client";

import { useEffect } from "react";

function isExtensionNoise(message: string, stackOrFilename: string) {
  const text = `${message} ${stackOrFilename}`.toLowerCase();
  return (
    text.includes("metamask") ||
    text.includes("chrome-extension://nkbihfbeogaeaoehlefnkodbefgpgknn") ||
    text.includes("failed to connect to metamask")
  );
}

export function BrowserNoiseGuard() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "development") {
      return;
    }

    const onUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      const message =
        typeof reason === "string"
          ? reason
          : reason && typeof reason === "object" && "message" in reason
            ? String((reason as { message?: unknown }).message ?? "")
            : "";
      const stack =
        reason && typeof reason === "object" && "stack" in reason
          ? String((reason as { stack?: unknown }).stack ?? "")
          : "";

      if (isExtensionNoise(message, stack)) {
        event.preventDefault();
      }
    };

    const onError = (event: ErrorEvent) => {
      if (isExtensionNoise(event.message ?? "", event.filename ?? "")) {
        event.preventDefault();
      }
    };

    window.addEventListener("unhandledrejection", onUnhandledRejection);
    window.addEventListener("error", onError);

    return () => {
      window.removeEventListener("unhandledrejection", onUnhandledRejection);
      window.removeEventListener("error", onError);
    };
  }, []);

  return null;
}
