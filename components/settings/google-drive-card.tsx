"use client";

import { useActionState } from "react";
import { CloudUpload, Link2, Unlink } from "lucide-react";
import { connectGoogleDrive, disconnectGoogleDrive, syncToGoogleDrive } from "@/server/actions/google-drive";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { ActionResult } from "@/server/actions/result";

const initialState: ActionResult = { ok: true };

export function GoogleDriveCard({
  connected,
  lastSyncedAt,
  available,
}: {
  connected: boolean;
  lastSyncedAt: string | null;
  available: boolean;
}) {
  const [syncState, syncAction, syncPending] = useActionState(syncToGoogleDrive, initialState);
  const [disconnectState, disconnectAction, disconnectPending] = useActionState(disconnectGoogleDrive, initialState);

  return (
    <Card className="p-5">
      <h2 className="text-base font-semibold">Google Drive Sync</h2>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        Резервная синхронизация сохраняет JSON-копию подкастов, заметок и тегов в ваш Google Drive.
      </p>

      {!available ? (
        <p className="mt-3 text-sm text-muted-foreground">
          Для включения добавьте `GOOGLE_DRIVE_CLIENT_ID`, `GOOGLE_DRIVE_CLIENT_SECRET` и `GOOGLE_DRIVE_REDIRECT_URI`.
        </p>
      ) : (
        <>
          <p className="mt-3 text-sm text-muted-foreground">
            Статус: {connected ? "Подключено" : "Не подключено"}
            {connected && lastSyncedAt ? ` • Последняя синхронизация: ${new Date(lastSyncedAt).toLocaleString("ru-RU")}` : ""}
          </p>

          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            {!connected ? (
              <form action={connectGoogleDrive} className="w-full sm:w-auto">
                <Button type="submit" className="w-full sm:w-auto">
                  <Link2 className="h-4 w-4" />
                  Подключить Google Drive
                </Button>
              </form>
            ) : (
              <>
                <form action={syncAction} className="w-full sm:w-auto">
                  <Button type="submit" disabled={syncPending} className="w-full sm:w-auto">
                    <CloudUpload className="h-4 w-4" />
                    {syncPending ? "Синхронизация..." : "Синхронизировать сейчас"}
                  </Button>
                </form>
                <form action={disconnectAction} className="w-full sm:w-auto">
                  <Button type="submit" variant="secondary" disabled={disconnectPending} className="w-full sm:w-auto">
                    <Unlink className="h-4 w-4" />
                    Отключить
                  </Button>
                </form>
              </>
            )}
          </div>

          {!syncState.ok ? (
            <p className="mt-3 text-sm text-destructive">{syncState.message}</p>
          ) : syncState.message ? (
            <p className="mt-3 text-sm text-muted-foreground">{syncState.message}</p>
          ) : null}

          {!disconnectState.ok ? (
            <p className="mt-2 text-sm text-destructive">{disconnectState.message}</p>
          ) : disconnectState.message ? (
            <p className="mt-2 text-sm text-muted-foreground">{disconnectState.message}</p>
          ) : null}
        </>
      )}
    </Card>
  );
}
