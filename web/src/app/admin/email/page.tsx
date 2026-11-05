import { AdminNav } from "@/components/admin/AdminNav";
import { requirePrisma } from "@/lib/prisma";
export const dynamic = "force-dynamic";
export default async function EmailAdminPage() {
  const db = requirePrisma();
  const [subscribers, pending, sent, failed, jobs] = await Promise.all([
    db.newsletterSubscription.count({ where: { confirmedAt: { not: null }, revokedAt: null } }),
    db.emailJob.count({ where: { sentAt: null, cancelledAt: null, attempts: { lt: 5 } } }),
    db.emailJob.count({ where: { sentAt: { not: null } } }),
    db.emailJob.count({ where: { sentAt: null, lastError: { not: null } } }),
    db.emailJob.findMany({ orderBy: { createdAt: "desc" }, take: 50 }),
  ]);
  return <div className="flex flex-1 flex-col"><AdminNav /><main className="mx-auto w-full max-w-7xl space-y-8 px-6 py-8 text-white"><h1 className="font-display text-5xl">Email e newsletter</h1>
    <div className="grid gap-4 sm:grid-cols-4">{[["Iscritti confermati", subscribers], ["Email in coda", pending], ["Accettate da SendGrid", sent], ["Invii da controllare", failed]].map(([label, value]) => <div key={label} className="border border-white/15 bg-[#121212] p-5"><p className="text-sm text-white/70">{label}</p><p className="mt-2 text-3xl">{value}</p></div>)}</div>
    <section className="space-y-3 border border-white/15 p-5 text-sm text-white/80"><h2 className="text-xl text-white">Programma automatico</h2><p>Conferma ordine al pagamento; tracking alla spedizione; aggiornamento per annullamento e rimborso. Il negozio riceve anche un avviso per ogni ordine pagato e quando una taglia arriva a zero senza prenotazioni ancora aperte.</p><p>Solo per iscritti confermati: benvenuto, promemoria carrello a 24 ore, consigli sul denim a 14 giorni; selezioni il giorno 1 e 15 del mese. Almeno 7 giorni fra email promozionali.</p><p>Selezioniamo capi attivi e disponibili, dando precedenza alle novità e ai prodotti in evidenza ed escludendo quelli già acquistati.</p><p>Il worker elabora la coda ogni 5 minuti. “Accettata” indica la presa in carico di SendGrid; consegna e bounce sono verificabili nel provider.</p></section>
    <div className="overflow-x-auto"><table className="w-full text-left text-sm"><caption className="mb-4 text-left text-xl">Ultime 50 comunicazioni</caption><thead><tr>{["Tipo", "Destinatario", "Programmata", "Stato", "Tentativi / errore"].map(label => <th key={label} className="border-b border-white/20 p-3">{label}</th>)}</tr></thead><tbody>{jobs.map(job => <tr key={job.id}><td className="border-b border-white/10 p-3">{job.kind}</td><td className="border-b border-white/10 p-3">{job.email}</td><td className="border-b border-white/10 p-3">{job.scheduledAt.toLocaleString("it-IT", { timeZone: "Europe/Rome" })}</td><td className="border-b border-white/10 p-3">{job.sentAt ? "Accettata" : job.cancelledAt ? "Annullata" : job.attempts >= 5 ? "Fallita" : job.lockedAt ? "In elaborazione" : "In coda"}</td><td className="border-b border-white/10 p-3">{job.attempts}{job.lastError ? ` · ${job.lastError}` : ""}</td></tr>)}</tbody></table></div>
  </main></div>;
}
