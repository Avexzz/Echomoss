import { Copy, ExternalLink, Link2, ShieldCheck, Unplug } from "lucide-react";
import { useState } from "react";
import { isNativeRuntime, openSpotifyDashboard } from "../lib/native";
import type { SpotifyStatus } from "../lib/types";
import { BotanicalSprite } from "./BotanicalSprite";

interface ConnectPanelProps {
  status: SpotifyStatus | null;
  loading: boolean;
  error: string | null;
  onSetClientId: (clientId: string) => Promise<void>;
  onConnect: () => Promise<void>;
  onDisconnect: () => Promise<void>;
}

export function ConnectPanel({
  status,
  loading,
  error,
  onSetClientId,
  onConnect,
  onDisconnect,
}: ConnectPanelProps) {
  const [clientId, setClientId] = useState("");
  const [copied, setCopied] = useState(false);
  const isDesktop = isNativeRuntime();

  const copyRedirect = async () => {
    if (!status?.redirectUri) return;
    try {
      await navigator.clipboard.writeText(status.redirectUri);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1_500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <section
      className="connect-panel"
      data-connected={status?.connected || undefined}
    >
      <div className="panel-label">
        <span>SPOTIFY NOOK</span>
        <span className="panel-label__reading">
          <i className={status?.connected ? "link-dot is-live" : "link-dot"} />
          {status?.connected ? "awake" : "optional"}
        </span>
      </div>

      <div className="connect-panel__intro">
        <div className="connect-panel__icon">
          <BotanicalSprite index={7} size="medium" />
        </div>
        <div className="connect-panel__copy">
          <span className="connect-panel__eyebrow">
            {status?.connected ? "MUSIC FOUND" : "ONE-TIME SETUP"}
          </span>
          <h2>
            {status?.connected
              ? "The moss can hear you!"
              : "Bring your music in"}
          </h2>
          <p>
            {isDesktop
              ? "Only track details are read. Your login stays safely on this computer."
              : "This preview uses tiny fictional songs. Spotify lives in the desktop app."}
          </p>
        </div>
      </div>

      {isDesktop && !status?.configured ? (
        <form
          className="connect-form"
          onSubmit={(event) => {
            event.preventDefault();
            void onSetClientId(clientId);
          }}
        >
          <label htmlFor="client-id">Spotify Client ID</label>
          <div>
            <input
              autoComplete="off"
              id="client-id"
              maxLength={64}
              minLength={16}
              onChange={(event) => setClientId(event.target.value)}
              placeholder="Paste your app Client ID"
              spellCheck="false"
              value={clientId}
            />
            <button disabled={loading || !clientId.trim()} type="submit">
              Save
            </button>
          </div>
          <small>Add the little address below to your Spotify app.</small>
        </form>
      ) : null}

      {isDesktop && status?.redirectUri && !status.connected ? (
        <button
          className="redirect-uri"
          onClick={() => void copyRedirect()}
          type="button"
        >
          <span>{status.redirectUri}</span>
          <Copy size={13} />
          <em>{copied ? "copied" : "copy redirect"}</em>
        </button>
      ) : null}

      <div className="connect-panel__actions">
        {isDesktop && status?.configured && !status.connected ? (
          <button
            className="button button--primary"
            disabled={loading}
            onClick={() => void onConnect()}
            type="button"
          >
            <Link2 size={15} />
            {loading ? "Opening Spotify…" : "Wake with Spotify"}
          </button>
        ) : null}
        {isDesktop && status?.connected ? (
          <button
            className="button"
            disabled={loading}
            onClick={() => void onDisconnect()}
            type="button"
          >
            <Unplug size={15} />
            Disconnect
          </button>
        ) : null}
        <button
          className="button button--ghost"
          onClick={() => void openSpotifyDashboard()}
          type="button"
        >
          Spotify app page
          <ExternalLink size={13} />
        </button>
      </div>

      <p className="connect-panel__privacy">
        <ShieldCheck size={12} />
        PKCE · no secret · stays on this pc
      </p>

      {error ? (
        <p aria-live="polite" className="connect-panel__error">
          {error}
        </p>
      ) : null}
    </section>
  );
}
