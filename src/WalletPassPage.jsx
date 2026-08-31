import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import appleButton from "./assets/AppleButton.svg";
import googleButton from "./assets/GoogleButton.svg";
import { WALLET_API_BASE_URL } from "./config";

const PLATFORM_CONFIG = {
  apple: {
    label: "Apple Wallet",
    heading: "Add Pass to Your Apple Wallet",
    description: "Tap below to securely add your digital pass to Apple Wallet.",
    button: appleButton,
    buttonAlt: "Add to Apple Wallet",
  },
  google: {
    label: "Google Wallet",
    heading: "Add Pass to Your Google Wallet",
    description: "Tap below to securely add your digital pass to Google Wallet.",
    button: googleButton,
    buttonAlt: "Add to Google Wallet",
  },
};

async function parseWalletError(response) {
  const data = await response.json().catch(() => ({}));
  const message = data.error || "Something went wrong. Please try again.";

  if (response.status === 410) {
    return (
      message ||
      "This link has expired. Please contact your administrator for a new one."
    );
  }

  if (response.status === 400) {
    return message;
  }

  if (response.status === 502) {
    return message || "Unable to generate your pass. Please try again later.";
  }

  return message;
}

export default function WalletPassPage({ platform }) {
  const { token } = useParams();
  const platformConfig = PLATFORM_CONFIG[platform];

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [generateError, setGenerateError] = useState("");
  const [generating, setGenerating] = useState(false);

  const fetchWalletDetails = useCallback(async () => {
    if (!token) {
      setLoadError("This link is invalid or incomplete. Please use the link sent to you.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setLoadError("");

    try {
      const response = await fetch(`${WALLET_API_BASE_URL}/${platform}/${token}/`);

      if (!response.ok) {
        setLoadError(await parseWalletError(response));
        return;
      }

      await response.json();
    } catch {
      setLoadError("Unable to load your pass details. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }, [platform, token]);

  useEffect(() => {
    fetchWalletDetails();
  }, [fetchWalletDetails]);

  const handleAddToWallet = async () => {
    if (!token || generating || loadError) return;

    setGenerating(true);
    setGenerateError("");

    try {
      const response = await fetch(
        `${WALLET_API_BASE_URL}/${platform}/${token}/generate/`,
        { method: "POST" }
      );

      if (!response.ok) {
        setGenerateError(await parseWalletError(response));
        return;
      }

      if (platform === "apple") {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "pass.pkpass";
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
        return;
      }

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
        return;
      }

      setGenerateError("Unable to open Google Wallet. Please try again.");
    } catch {
      setGenerateError("Something went wrong. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  const year = new Date().getFullYear();
  const canAdd = !loading && !loadError && !!token;
  const error = loadError || generateError;

  return (
    <div className="flex min-h-screen flex-col bg-white font-sans text-slate-900">
      <main className="flex flex-1 flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-lg text-center">
          <h1 className="text-3xl font-bold tracking-tight text-black sm:text-4xl">
            {platformConfig.heading}
          </h1>
          <p className="mx-auto mt-4 max-w-md text-base text-slate-500 sm:text-lg">
            {platformConfig.description}
          </p>

          {loading && (
            <p className="mt-8 text-sm text-slate-400">Loading your pass details...</p>
          )}

          {error && (
            <p className="mt-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </p>
          )}

          {canAdd && (
            <div className="mt-10 flex flex-col items-center gap-5">
              <button
                type="button"
                onClick={handleAddToWallet}
                disabled={generating}
                className="transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label={platformConfig.buttonAlt}
              >
                <img
                  src={platformConfig.button}
                  alt={platformConfig.buttonAlt}
                  className="h-[55px] w-auto"
                />
              </button>

              {generating && (
                <p className="text-sm text-slate-400">
                  Generating your {platformConfig.label} pass...
                </p>
              )}
            </div>
          )}
        </div>
      </main>

      <footer className="pb-8 text-center text-sm text-slate-400">
        &copy; {year} Enterprise Infotech. All rights reserved.
      </footer>
    </div>
  );
}
