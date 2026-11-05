"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") || "/admin";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/admin/auth/login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Credenziali non valide.");
      }
      router.push(nextPath);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore durante l'accesso.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 py-16">
      <div className="border border-white/15 bg-[#121212] p-8 shadow-2xl">
        <div className="text-center">
          <span className="inline-block border border-[#e01010]/40 bg-[#e01010]/15 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.22em] text-[#ff5252]">
            Area Riservata
          </span>
          <h1 className="mt-3 font-display text-5xl tracking-wider text-white">
            JACOPO <span className="text-[#e01010]">PECA</span>
          </h1>
          <p className="mt-2 text-sm text-white/55">
            Accedi al pannello di gestione catalogo, ordini e spedizioni.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.18em] text-white/55">
              Email Amministratore
            </span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="jacopopecajp@gmail.com"
              autoComplete="username"
              required
              className="input-admin py-3 text-base"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.18em] text-white/55">
              Password
            </span>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                autoComplete="current-password"
                required
                className="input-admin py-3 pr-20 text-base"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer text-xs font-semibold uppercase text-white/50 hover:text-white"
              >
                {showPassword ? "Nascondi" : "Mostra"}
              </button>
            </div>
          </label>

          {error && (
            <div className="border border-red-400/40 bg-red-500/15 px-4 py-3 text-xs font-medium text-red-200">
              ⚠️ {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full cursor-pointer border-2 border-[#e01010] bg-[#e01010] py-3.5 text-sm font-bold uppercase tracking-[0.2em] text-white transition hover:bg-[#b80d0d] disabled:opacity-50"
          >
            {loading ? "Accesso in corso…" : "Entra nella Dashboard →"}
          </button>
        </form>
      </div>
    </main>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <main className="flex flex-1 items-center justify-center py-20 text-white/50">
          Caricamento…
        </main>
      }
    >
      <AdminLoginForm />
    </Suspense>
  );
}
