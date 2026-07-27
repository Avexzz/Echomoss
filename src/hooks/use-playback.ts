import { useCallback, useEffect, useRef, useState } from "react";
import { createDemoPlayback, demoTrackCount } from "../lib/demo";
import { invokeNative, isNativeRuntime } from "../lib/native";
import type {
  Playback,
  PlaybackAction,
  PlaybackController,
  SpotifyStatus,
} from "../lib/types";

const POLL_INTERVAL = 8_000;

export function usePlayback(): PlaybackController {
  const native = isNativeRuntime();
  const [status, setStatus] = useState<SpotifyStatus | null>(null);
  const [playback, setPlayback] = useState<Playback | null>(() =>
    createDemoPlayback(),
  );
  const [loading, setLoading] = useState(native);
  const [error, setError] = useState<string | null>(null);
  const demoIndex = useRef(0);
  const refreshInFlight = useRef<Promise<void> | null>(null);

  const refresh = useCallback((): Promise<void> => {
    if (!native) return Promise.resolve();
    if (refreshInFlight.current) return refreshInFlight.current;

    const operation = (async () => {
      try {
        const nextStatus = await invokeNative<SpotifyStatus>("spotify_status");
        setStatus(nextStatus);
        if (nextStatus.connected) {
          const nextPlayback = await invokeNative<Playback | null>(
            "spotify_playback",
          );
          setPlayback(nextPlayback);
        }
        setError(null);
      } catch (caught) {
        setError(messageFrom(caught));
      } finally {
        setLoading(false);
      }
    })();

    refreshInFlight.current = operation;
    void operation.finally(() => {
      if (refreshInFlight.current === operation) {
        refreshInFlight.current = null;
      }
    });
    return operation;
  }, [native]);

  useEffect(() => {
    if (!native) return;
    const initial = window.setTimeout(() => void refresh(), 0);
    const poll = window.setInterval(() => {
      if (!document.hidden) void refresh();
    }, POLL_INTERVAL);
    const refreshWhenVisible = () => {
      if (!document.hidden) void refresh();
    };
    document.addEventListener("visibilitychange", refreshWhenVisible);
    return () => {
      window.clearTimeout(initial);
      window.clearInterval(poll);
      document.removeEventListener("visibilitychange", refreshWhenVisible);
    };
  }, [native, refresh]);

  useEffect(() => {
    const tick = window.setInterval(() => {
      setPlayback((current) => {
        if (!current?.isPlaying) return current;
        const elapsed = Date.now() - current.fetchedAt;
        const progressMs = Math.min(
          current.durationMs,
          current.progressMs + elapsed,
        );
        if (
          progressMs >= current.durationMs &&
          (!native || !status?.connected)
        ) {
          demoIndex.current = (demoIndex.current + 1) % demoTrackCount();
          return createDemoPlayback(demoIndex.current);
        }
        return { ...current, progressMs, fetchedAt: Date.now() };
      });
    }, 1_000);
    return () => window.clearInterval(tick);
  }, [native, status?.connected]);

  const setClientId = useCallback(
    async (clientId: string) => {
      if (!native) return;
      setLoading(true);
      try {
        setStatus(
          await invokeNative<SpotifyStatus>("spotify_set_client_id", {
            clientId,
          }),
        );
        setError(null);
      } catch (caught) {
        setError(messageFrom(caught));
      } finally {
        setLoading(false);
      }
    },
    [native],
  );

  const connect = useCallback(async () => {
    if (!native) return;
    setLoading(true);
    try {
      setStatus(await invokeNative<SpotifyStatus>("spotify_connect"));
      await refresh();
    } catch (caught) {
      setError(messageFrom(caught));
    } finally {
      setLoading(false);
    }
  }, [native, refresh]);

  const disconnect = useCallback(async () => {
    if (!native) return;
    setLoading(true);
    try {
      setStatus(await invokeNative<SpotifyStatus>("spotify_disconnect"));
      demoIndex.current = 0;
      setPlayback(createDemoPlayback());
      setError(null);
    } catch (caught) {
      setError(messageFrom(caught));
    } finally {
      setLoading(false);
    }
  }, [native]);

  const control = useCallback(
    async (action: PlaybackAction) => {
      if (native && status?.connected) {
        setLoading(true);
        if (action === "play" || action === "pause") {
          setPlayback((current) =>
            current
              ? {
                  ...current,
                  isPlaying: action === "play",
                  fetchedAt: Date.now(),
                }
              : current,
          );
        }
        try {
          await invokeNative<void>("spotify_control", { action });
          window.setTimeout(() => void refresh(), 320);
          setError(null);
        } catch (caught) {
          setError(messageFrom(caught));
          await refresh();
        } finally {
          setLoading(false);
        }
        return;
      }

      setPlayback((current) => {
        if (!current) return createDemoPlayback();
        if (action === "play")
          return { ...current, isPlaying: true, fetchedAt: Date.now() };
        if (action === "pause")
          return { ...current, isPlaying: false, fetchedAt: Date.now() };
        const direction = action === "next" ? 1 : -1;
        demoIndex.current =
          (demoIndex.current + direction + demoTrackCount()) % demoTrackCount();
        return createDemoPlayback(demoIndex.current);
      });
    },
    [native, refresh, status?.connected],
  );

  return {
    mode: native && status?.connected ? "spotify" : "demo",
    playback,
    status,
    loading,
    error,
    setClientId,
    connect,
    disconnect,
    control,
  };
}

function messageFrom(error: unknown): string {
  return error instanceof Error
    ? error.message
    : "Something interrupted the signal.";
}
