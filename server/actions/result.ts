export type ActionResult =
  | { ok: true; message?: string }
  | { ok: false; message: string; fieldErrors?: Record<string, string[]> };

export function failure(message: string): ActionResult {
  return { ok: false, message };
}

export function success(message?: string): ActionResult {
  return { ok: true, message };
}
