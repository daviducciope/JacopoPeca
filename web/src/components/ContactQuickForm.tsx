"use client";

import { useState, type ReactNode } from "react";
import { ArrowUpRight, Mail, MessageCircle, Sparkles } from "lucide-react";

import { contactInfo } from "@/lib/editorial-data";

const TOPICS = [
  {
    id: "custom",
    label: "Custom su Misura (1/1)",
    placeholder:
      "Descrivi il capo base (jeans, giacca, felpa...), la tua taglia e l'idea o lavorazione che vorresti realizzare...",
  },
  {
    id: "product",
    label: "Info Capo & Misure Taglia",
    placeholder:
      "Indica il nome del capo visto sullo Store e la taglia di cui vorresti conoscere vestibilità o misure in cm...",
  },
  {
    id: "order",
    label: "Ordine & Spedizione",
    placeholder:
      "Inserisci il riferimento del tuo ordine o la tua richiesta relativa a spedizione, tracking o cambio...",
  },
  {
    id: "collab",
    label: "Shooting / Collaborazione",
    placeholder:
      "Raccontaci il progetto, l'evento, lo styling o la collaborazione che hai in mente...",
  },
] as const;

type ContactQuickFormProps = {
  defaultTopic?: (typeof TOPICS)[number]["id"];
  eyebrow?: string;
  title?: string;
  intro?: ReactNode;
};

export default function ContactQuickForm({
  defaultTopic = "custom",
  eyebrow = "Messaggio Rapido // Diretto in Laboratorio",
  title = "Scrivi subito a Jacopo",
  intro = (
    <>
      Seleziona il motivo del contatto, compila i dettagli essenziali e invia la richiesta in un clic su{" "}
      <strong className="font-semibold text-white">WhatsApp</strong> o via{" "}
      <strong className="font-semibold text-white">Email</strong>, senza attese o call center.
    </>
  ),
}: ContactQuickFormProps) {
  const [topicId, setTopicId] = useState<(typeof TOPICS)[number]["id"]>(defaultTopic);
  const [name, setName] = useState("");
  const [reference, setReference] = useState("");
  const [message, setMessage] = useState("");
  const [honeypot, setHoneypot] = useState("");

  const activeTopic = TOPICS.find((t) => t.id === topicId) || TOPICS[0];

  function buildFormattedMessage() {
    const lines = [
      `Ciao Jacopo! Ti contatto dal sito jacopopeca.com`,
      `• Argomento: ${activeTopic.label}`,
      name.trim() ? `• Nome: ${name.trim()}` : null,
      reference.trim() ? `• Capo / Taglia / Rif.: ${reference.trim()}` : null,
      message.trim() ? `\n${message.trim()}` : null,
    ].filter(Boolean);
    return lines.join("\n");
  }

  function handleWhatsApp() {
    if (honeypot) return;
    const text = encodeURIComponent(buildFormattedMessage());
    window.open(`${contactInfo.whatsappHref}?text=${text}`, "_blank", "noopener,noreferrer");
  }

  function handleEmail() {
    if (honeypot) return;
    const subject = encodeURIComponent(
      `[Jacopo Peca Store] ${activeTopic.label}${
        reference.trim() ? ` — ${reference.trim()}` : ""
      }`
    );
    const body = encodeURIComponent(buildFormattedMessage());
    window.location.href = `mailto:${contactInfo.email}?subject=${subject}&body=${body}`;
  }

  return (
    <div className="border border-white/15 bg-[#121212] p-6 sm:p-8">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.3em] text-red-500">
        <Sparkles size={14} />
        <span>{eyebrow}</span>
      </div>

      <h2 className="mt-2 font-display text-4xl text-white sm:text-5xl">
        {title}
      </h2>

      <p className="mt-2 text-sm leading-relaxed text-white/80">{intro}</p>

      {/* Topic Selector Pills */}
      <div className="mt-6">
        <label className="block text-[11px] font-bold uppercase tracking-[0.22em] text-white/70">
          1. Di cosa hai bisogno?
        </label>
        <div className="mt-2.5 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {TOPICS.map((topic) => {
            const isSelected = topic.id === topicId;
            return (
              <button
                key={topic.id}
                type="button"
                onClick={() => setTopicId(topic.id)}
                className={`border px-3.5 py-2.5 text-left text-xs font-bold uppercase tracking-[0.14em] transition ${
                  isSelected
                    ? "border-red-600 bg-red-600 text-white shadow-[0_0_20px_rgba(224,16,16,0.3)]"
                    : "border-white/15 bg-black/50 text-white/80 hover:border-white/45 hover:text-white"
                }`}
              >
                {topic.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Inputs */}
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="contact-name"
            className="block text-[11px] font-bold uppercase tracking-[0.2em] text-white/70"
          >
            2. Il tuo nome
          </label>
          <input
            id="contact-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Es. Marco"
            className="mt-2 w-full border border-white/20 bg-black/60 px-3.5 py-2.5 text-sm text-white placeholder:text-white/35 focus:border-white/60 focus:outline-none"
          />
        </div>

        <div>
          <label
            htmlFor="contact-ref"
            className="block text-[11px] font-bold uppercase tracking-[0.2em] text-white/70"
          >
            3. Capo / Taglia (opzionale)
          </label>
          <input
            id="contact-ref"
            type="text"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            placeholder="Es. Jeans Senza Luce — Taglia W32"
            className="mt-2 w-full border border-white/20 bg-black/60 px-3.5 py-2.5 text-sm text-white placeholder:text-white/35 focus:border-white/60 focus:outline-none"
          />
        </div>
      </div>

      <div className="mt-4">
        <label
          htmlFor="contact-message"
          className="block text-[11px] font-bold uppercase tracking-[0.2em] text-white/70"
        >
          4. Il tuo messaggio
        </label>
        <textarea
          id="contact-message"
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={activeTopic.placeholder}
          className="mt-2 w-full border border-white/20 bg-black/60 p-3.5 text-sm leading-relaxed text-white placeholder:text-white/35 focus:border-white/60 focus:outline-none"
        />
        <input
          name="website"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
          tabIndex={-1}
          autoComplete="off"
          className="hidden"
          aria-hidden="true"
        />
      </div>

      {/* Submit Actions */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={handleWhatsApp}
          className="inline-flex flex-1 items-center justify-center gap-2.5 border-2 border-white bg-white px-6 py-4 text-xs font-bold uppercase tracking-[0.22em] text-black transition hover:border-red-600 hover:bg-red-600 hover:text-white"
        >
          <MessageCircle size={17} />
          Invia su WhatsApp
          <ArrowUpRight size={15} />
        </button>

        <button
          type="button"
          onClick={handleEmail}
          className="inline-flex items-center justify-center gap-2.5 border border-white/25 bg-white/[0.03] px-6 py-4 text-xs font-bold uppercase tracking-[0.22em] text-white transition hover:border-white hover:bg-white/10"
        >
          <Mail size={16} />
          Invia via Email
        </button>
      </div>
    </div>
  );
}

