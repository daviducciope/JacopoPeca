# Carrello, checkout ed email — 5 novembre 2026

## Comportamento

Il checkout usa esclusivamente il server: prezzi, stato del prodotto, taglia e stock sono letti dal database. Le quantità devono essere intere (1–20); righe duplicate e carrelli non validi vengono respinti. Il paese scelto nel carrello determina tariffa e paese consentito su Stripe, impedendo di selezionare una tariffa italiana per un indirizzo estero. Il riepilogo usa le impostazioni spedizione dell’admin.

Lo stock viene prenotato atomicamente prima di creare la sessione Stripe (scadenza un’ora), consumato al pagamento e restituito una sola volta in caso di scadenza o pagamento asincrono fallito. Una riconciliazione periodica recupera le sessioni rimaste sospese per errori di rete. Per riconciliare importazioni precedenti è ancora disponibile la sincronizzazione ordini dell’admin. Il carrello si svuota soltanto dopo una conferma di pagamento verificata sul server.

## Email

| Evento | Quando | Consenso newsletter |
|---|---|---|
| Richiesta iscrizione | Worker successivo, massimo una richiesta per indirizzo ogni 24 ore | Richiesta esplicita; link da confermare entro 7 giorni |
| Benvenuto | Dopo conferma dell’iscrizione | Sì |
| Conferma ordine | Pagamento Stripe confermato | No |
| Spedizione | Ordine segnato spedito o aggiornamento tracking | No |
| Annullamento / rimborso | Aggiornamento dello stato; rimborso totale Stripe ricevuto via webhook | No |
| Recupero carrello | 24 ore dopo la scadenza del checkout | Sì; email nota e nessun acquisto successivo |
| Cura denim e abbinamenti | 14 giorni dopo l’acquisto | Sì |
| Selezione dal laboratorio | Giorno 1, dalle 10:00 Europe/Rome | Sì |
| Dettagli e abbinamenti | Giorno 15, dalle 10:00 Europe/Rome | Sì |

Le due selezioni scelgono fino a tre capi attivi e disponibili di categorie diverse, privilegiando prodotti in evidenza e novità, escludendo quelli già acquistati. La seconda selezione cambia il punto di partenza. Il catalogo viene verificato nuovamente al momento dell’invio, così i prodotti nel frattempo esauriti non vengono proposti.

Almeno sette giorni fra invii promozionali. Il recupero carrello viene annullato se è già partita un’altra promozione nella settimana; benvenuto, consigli e selezioni possono essere rinviati. Le comunicazioni necessarie agli ordini non dipendono dall’iscrizione. Nessuna iscrizione automatica dei clienti preesistenti.

La newsletter è disponibile nel footer e come opzione non preselezionata nel carrello. Il consenso registra provenienza, richiesta, versione dell’informativa, conferma e revoca. I link di conferma sono monouso; una visita GET non conferma automaticamente l’iscrizione. Ogni email promozionale ha disiscrizione e intestazioni List-Unsubscribe, incluso il POST one-click. La revoca annulla le promozioni ancora in coda e aggiorna Customer.marketingOpt.

## Provider e configurazione

- Stripe: account live Arsolving autorizzato; webhook dedicato `https://jacopopeca.com/api/webhooks/stripe/`. Non modificare i webhook degli altri progetti sullo stesso account.
- Eventi: checkout.session.completed, checkout.session.async_payment_succeeded, checkout.session.expired, checkout.session.async_payment_failed, charge.refunded.
- SendGrid: dominio `jacopopeca.com` autenticato; mittente `info@jacopopeca.com`, nome Jacopo Peca, Reply-To `jacopopecajp@gmail.com`.
- Gruppo disiscrizioni dedicato: Jacopo Peca Newsletter, ID 41629. I gruppi degli altri progetti non sono usati.
- `jacopopeca.com` non era autenticato al controllo iniziale: sono stati creati solo i record CNAME dedicati al return-path `em-jp` e al selettore DKIM `jpc`. La validazione SendGrid ha confermato tutti e tre i record. Non sono stati modificati MX né record di altri servizi.
- Segreti esclusivamente nei file env esclusi da Git e nell’ambiente del runtime. Non copiarli in questo documento.

Variabili: STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, SENDGRID_API_KEY, SENDGRID_FROM_EMAIL, SENDGRID_REPLY_TO_EMAIL, SENDGRID_MARKETING_GROUP_ID, CRON_SECRET, NEXT_PUBLIC_SITE_URL.

## Scheduler e monitoraggio

I file `ops/systemd/jacopopeca-email.service` e `.timer` chiamano la coda dall’interno del container ogni cinque minuti. Il segreto viene letto dall’ambiente del container, senza inserirlo nel crontab o negli argomenti di curl.

- Endpoint: POST /api/cron/email/ con Bearer CRON_SECRET; non esposto senza autenticazione.
- Dashboard: /admin/email/, protetta dall’autenticazione admin.
- Stato systemd: `sudo systemctl status jacopopeca-email.timer`.
- Log: `sudo journalctl -u jacopopeca-email.service`.
- Ogni job ha chiave di deduplicazione, claim atomico, tentativi e ultimo errore. Retry con attesa crescente fino a cinque tentativi. I job rimasti bloccati oltre 15 minuti vengono segnalati per controllo della consegna prima di un eventuale nuovo invio.
- “Accettata” significa accettazione dell’API SendGrid, non certificazione della consegna nella casella finale. Verificare bounce e soppressioni nel provider.
- La migrazione SQL è solo additiva; non eseguire seed né reset del catalogo per aggiornare queste funzionalità. Il repository non aveva una baseline Prisma migrate: applicare lo SQL dedicato o predisporre una baseline prima di usare migrate deploy su tutto lo schema.

## Verifiche

`npm run lint`, `npx tsc --noEmit`, `npm run build -- --webpack`.

`npm run test:commerce` usa il DATABASE_URL locale: crea un prodotto in bozza e record temporanei con indirizzo example.invalid, simula SendGrid e ripulisce i dati. Verifica prenotazioni concorrenti, rilascio idempotente, deduplicazione email, consenso, revoca, frequenza e retry. Non effettua pagamenti né invia email.

Il controllo provider ha verificato Stripe live abilitato agli addebiti e SendGrid sandbox HTTP 200, senza consegna. Le prove checkout live creano sessioni non pagate e le fanno scadere: non equivalgono a un pagamento reale con carta.

## Pubblicazione

`node ops/deploy-commerce-update.mjs` conserva la configurazione DB/admin del server, salva immagine e sorgenti precedenti, aggiorna il runtime e abilita il timer. Non esegue seed o reset. La migrazione additiva deve essere già applicata.

Rollback runtime: ripristinare `.env.production.before-commerce`, assegnare nuovamente il tag `jacopopeca-app` all’immagine `jacopopeca-app:before-commerce-20261105`, ricreare il servizio app e disabilitare il timer se si torna a un runtime senza endpoint email. Le nuove tabelle possono restare presenti.

## Esito verifiche live

- Checkout live creato senza pagamento e fatto scadere. Il webhook Stripe reale ha riportato la prenotazione a RELEASED e ripristinato esattamente la quantità iniziale; nessun ordine è stato creato.
- Endpoint pubblici verificati: rifiuto di quantità frazionarie, carrello malformato, iscrizione senza consenso, webhook senza firma e worker senza segreto. Sessioni inesistenti non vengono confermate.
- Timer systemd attivo: esecuzione completata con HTTP 200.
- Una sola email tecnica, distinta da qualsiasi acquisto, inviata dalla coda al contatto del negozio `jacopopecajp@gmail.com`: accettata da SendGrid al primo tentativo, senza errori. Non è una certificazione di lettura o consegna nella casella finale.
- Tre test di integrazione su scorte, consenso/coda e conferma pagamento simulata passati; test aggiuntivo degli origin pubblici dietro proxy passato. Nessun addebito reale.
- Il browser integrato della sessione non era disponibile: il controllo live è stato eseguito sulle API e sul contenuto HTML, senza verifica visuale interattiva.
