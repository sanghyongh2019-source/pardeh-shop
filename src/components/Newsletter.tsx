"use client";

import { useState } from "react";
import { Send } from "lucide-react";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setStatus(res.ok ? "done" : "error");
    } catch {
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <p className="text-sm font-bold" style={{ color: "var(--brass)" }}>
        عضویت شما ثبت شد — از تخفیف‌های بعدی باخبر می‌شوید.
      </p>
    );
  }

  return (
    <form onSubmit={submit} className="flex gap-2 max-w-md mx-auto">
      <input
        required
        type="email"
        placeholder="ایمیل شما"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="flex-1 px-4 py-3 text-sm rounded-sm"
        style={{ background: "rgba(246,240,228,.08)", border: "1px solid var(--line)", color: "var(--cream)" }}
      />
      <button
        type="submit"
        disabled={status === "loading"}
        className="btn-brass px-5 py-3 rounded-sm text-sm flex items-center gap-2 disabled:opacity-60"
      >
        <Send size={14} /> عضویت
      </button>
    </form>
  );
}
