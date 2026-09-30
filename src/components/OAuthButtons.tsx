import { useState } from "react";
import { toast } from "sonner";

import { lovable } from "@/integrations/lovable/index";

export function OAuthButtons({ label = "or continue with" }: { label?: string }) {
  const [busy, setBusy] = useState(false);

  async function go(provider: "google" | "apple") {
    setBusy(true);
    try {
      const result = await lovable.auth.signInWithOAuth(provider, {
        redirect_uri: window.location.origin,
      });
      if (result.error) {
        toast.error(result.error.message || "Sign-in failed. Please try again.");
        setBusy(false);
        return;
      }
      if (result.redirected) return;
      window.location.assign("/dashboard");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Sign-in failed.");
      setBusy(false);
    }
  }

  return (
    <>
      <div className="div">{label}</div>
      <div className="oa">
        <button type="button" disabled={busy} onClick={() => go("google")}>
          <svg viewBox="0 0 48 48" aria-hidden="true">
            <path
              fill="#EA4335"
              d="M24 9.5c3.5 0 6.6 1.2 9 3.6l6.7-6.7C35.5 2.5 30.1 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.8 6.1C12.3 13.2 17.6 9.5 24 9.5z"
            />
            <path
              fill="#4285F4"
              d="M46.5 24.5c0-1.6-.15-3.1-.44-4.5H24v9h12.6c-.55 2.9-2.2 5.3-4.6 7l7.6 5.9c4.4-4.1 6.9-10.1 6.9-17.4z"
            />
            <path
              fill="#FBBC05"
              d="M10.4 28.7A14.6 14.6 0 0 1 9.6 24c0-1.6.3-3.2.8-4.7l-7.8-6.1A24 24 0 0 0 0 24c0 3.9.9 7.5 2.6 10.8l7.8-6.1z"
            />
            <path
              fill="#34A853"
              d="M24 48c6.1 0 11.3-2 15-5.5l-7.6-5.9c-2.1 1.4-4.8 2.3-7.4 2.3-6.4 0-11.7-3.7-13.6-9.2l-7.8 6.1C6.5 42.6 14.6 48 24 48z"
            />
          </svg>
          Continue with Google
        </button>
        <button type="button" className="ap" disabled={busy} onClick={() => go("apple")}>
          <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M16.7 12.8c0-2.4 2-3.6 2.1-3.6-1.1-1.7-2.9-1.9-3.5-1.9-1.5-.1-2.8.9-3.5.9s-1.9-.9-3.1-.8C6.9 7.4 5.3 8.4 4.4 10c-1.8 3.1-.5 7.7 1.3 10.2.9 1.2 1.9 2.6 3.3 2.5 1.3 0 1.8-.8 3.4-.8s2 .8 3.4.8 2.3-1.2 3.2-2.5c1-1.4 1.4-2.8 1.4-2.9-.1 0-2.7-1-2.7-4.5zM14.6 4.8c.7-.9 1.2-2.1 1.1-3.3-1 0-2.3.7-3 1.6-.7.8-1.2 2-1.1 3.2 1.1.1 2.3-.6 3-1.5z" />
          </svg>
          Continue with Apple
        </button>
      </div>
    </>
  );
}
