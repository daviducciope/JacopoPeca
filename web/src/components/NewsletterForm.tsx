"use client";
import { useState } from "react";
import Link from "next/link";
export default function NewsletterForm() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  return <form className="mx-auto max-w-[1280px] px-5 pb-10 text-sm text-white/70" onSubmit={async event => {
    event.preventDefault(); if (loading) return;
    const form = event.currentTarget;
    const data = new FormData(form); setLoading(true); setMessage("");
    try {
      const response = await fetch("/api/newsletter", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: data.get("email"), consent: data.get("consent") === "on", website: data.get("website") }) });
      const result = await response.json(); setMessage(result.message || result.error);
      if (response.ok) form.reset();
    } catch { setMessage("Iscrizione non disponibile. Riprova più tardi."); } finally { setLoading(false); }
  }}>
    <h3 className="font-display text-2xl text-white">Dal laboratorio, nella tua inbox.</h3>
    <p className="my-3">Nuove uscite, denim artigianale e abbinamenti. Due email al mese.</p>
    <label htmlFor="newsletter-email" className="block mb-2">La tua email</label>
    <div className="flex flex-wrap gap-3"><input id="newsletter-email" name="email" type="email" autoComplete="email" maxLength={254} required className="min-w-0 border border-white/30 bg-transparent p-3 text-white" placeholder="nome@esempio.it" /><button disabled={loading} className="bg-white px-5 py-3 text-black disabled:opacity-50">{loading ? "Invio…" : "Iscriviti alla newsletter"}</button></div>
    <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
    <label className="mt-3 flex max-w-xl items-start gap-3"><input name="consent" type="checkbox" required className="mt-1" /><span>Acconsento a ricevere la newsletter e le email promozionali Jacopo Peca. Posso disiscrivermi in ogni momento. <Link href="/privacy-policy" className="underline">Privacy</Link></span></label>
    <p role="status" className="mt-3">{message}</p>
  </form>;
}
