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
        <span>SIGNAL LINK</span>
        <span className="panel-label__reading">
          <i className={status?.connected ? "link-dot is-live" : "link-dot"} />
          {status?.connected ? "encrypted / live" : "optional"}
        </span>
      </div>

      <div className="connect-panel__intro">
        <div className="connect-panel__icon">
          <BotanicalSprite index={7} size="medium" />
        </div>
        <div className="connect-panel__copy">
          <span className="connect-panel__eyebrow">
            {status?.connected ? "LOCAL LINK ACTIVE" : "SPOTIFY BRIDGE"}
          </span>
          <h2>
            {status?.connected ? "Signal secured." : "Wake it with Spotify."}
          </h2>
          <p>
            {isDesktop
              ? "Playback metadata enters here. Tokens remain in the operating-system vault."
              : "Previewing with fictional local tracks. Spotify linking is available in the native app."}
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
          <small>
            Add the redirect URI below in your Spotify developer app.
          </small>
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
            {loading ? "Opening Spotify…" : "Connect Spotify"}
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
          Dashboard
          <ExternalLink size={13} />
        </button>
      </div>

      <p className="connect-panel__privacy">
        <ShieldCheck size={12} />
        PKCE · no client secret · local credential vault
      </p>

      {error ? (
        <p aria-live="polite" className="connect-panel__error">
          {error}
        </p>
      ) : null}
    </section>
  );
}
