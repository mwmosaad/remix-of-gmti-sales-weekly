import { useState } from "react";

import { supabase } from "@/integrations/supabase/client";

type Status = "idle" | "saving" | "done" | "error";

export function SubscribeForm() {
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [region, setRegion] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "saving") return;

    setStatus("saving");
    setMessage("");

    const { error } = await supabase.from("subscribers").insert({
      email: email.trim().toLowerCase(),
      full_name: fullName.trim() || null,
      region: region.trim() || null,
    });

    if (error) {
      // Unique violation — already on the list, which is a success for the reader.
      if (error.code === "23505") {
        setStatus("done");
        setMessage("You're already on the list.");
        return;
      }
      setStatus("error");
      setMessage("That didn't go through. Check the address and try again.");
      return;
    }

    setStatus("done");
    setMessage("You're on the list.");
    setEmail("");
    setFullName("");
    setRegion("");
  }

  return (
    <section id="subscribe" className="border-t border-border bg-paper">
      <div className="mx-auto max-w-5xl px-5 py-12">
        <p className="label-mono">Weekly brief</p>
        <h2 className="mt-2 font-display text-2xl font-bold tracking-tight text-ink">
          Join the GMTI sales distribution list
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Add yourself to the internal distribution list for the Fleet Intelligence brief. New
          editions go live here every Monday morning.
        </p>

        {status === "done" ? (
          <p className="mt-6 text-sm font-semibold text-ink">{message}</p>
        ) : (
          <form onSubmit={onSubmit} className="mt-6 grid gap-3 sm:grid-cols-[1.2fr_1fr_1fr_auto]">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@gmtiauto.com"
              aria-label="Work email"
              className="rounded-md border border-border bg-background px-3 py-2 text-sm text-ink outline-none transition-colors placeholder:text-muted-foreground focus:border-signal"
            />
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Name (optional)"
              aria-label="Name"
              className="rounded-md border border-border bg-background px-3 py-2 text-sm text-ink outline-none transition-colors placeholder:text-muted-foreground focus:border-signal"
            />
            <input
              type="text"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              placeholder="Region focus (optional)"
              aria-label="Region focus"
              className="rounded-md border border-border bg-background px-3 py-2 text-sm text-ink outline-none transition-colors placeholder:text-muted-foreground focus:border-signal"
            />
            <button
              type="submit"
              disabled={status === "saving"}
              className="rounded-md bg-signal px-5 py-2 text-sm font-semibold text-signal-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {status === "saving" ? "Adding…" : "Subscribe"}
            </button>
          </form>
        )}

        {status === "error" && <p className="mt-3 text-sm text-signal">{message}</p>}
      </div>
    </section>
  );
}
