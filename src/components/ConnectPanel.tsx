import { Copy, ExternalLink, Link2, Unplug } from "lucide-react";
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
    await navigator.clipboard.writeText(status.redirectUri);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1_500);
  };

  return (
    <section className="connect-panel">
      <div className="connect-panel__icon">
        <BotanicalSprite index={7} size="large" />
      </div>
      <div className="connect-panel__copy">
        <span className="connect-panel__eyebrow">
          {status?.connected ? "LOCAL LINK ACTIVE" : "OPTIONAL SPOTIFY LINK"}
        </span>
        <h2>
          {status?.connected
            ? "Your listening habitat is connected."
            : "Let Spotify wake the terrarium."}
        </h2>
        <p>
          {isDesktop
            ? "echomoss reads playback metadata through Spotify's official API. Tokens stay encrypted on this computer."
            : "The visual preview uses fictional local tracks. Run the native Tauri app to connect a Spotify account."}
        </p>
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
          Developer dashboard
          <ExternalLink size={13} />
        </button>
      </div>

      {error ? <p className="connect-panel__error">{error}</p> : null}
    </section>
  );
}
