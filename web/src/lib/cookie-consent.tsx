"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";

export const COOKIE_CONSENT_KEY = "jp-cookie-consent-v1";

export type CookiePreferences = {
  /** Always true: cart localStorage, consent storage, security/session cookies. */
  necessary: true;
  /** External embeds such as interactive Google Maps on /contatti. */
  externalMedia: boolean;
  /** Timestamp ISO string of when the user made the choice. */
  updatedAt: string;
  /** Policy version accepted/configured. */
  version: "1.0";
};

type Snapshot = {
  hydrated: boolean;
  preferences: CookiePreferences | null;
};

type CookieConsentContextValue = {
  /** Current saved preferences, or null if the user has not interacted yet. */
  preferences: CookiePreferences | null;
  /** True once client hydration has read localStorage. */
  hydrated: boolean;
  /** Whether the preferences modal/drawer is explicitly open. */
  preferencesOpen: boolean;
  acceptAll: () => void;
  rejectNonEssential: () => void;
  savePreferences: (prefs: { externalMedia: boolean }) => void;
  openPreferences: () => void;
  closePreferences: () => void;
};

const CookieConsentContext = createContext<CookieConsentContextValue | null>(null);

function readStoredPreferences(): CookiePreferences | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<CookiePreferences>;
    if (typeof parsed.externalMedia !== "boolean") return null;
    return {
      necessary: true,
      externalMedia: parsed.externalMedia,
      updatedAt:
        typeof parsed.updatedAt === "string"
          ? parsed.updatedAt
          : new Date().toISOString(),
      version: "1.0",
    };
  } catch {
    return null;
  }
}

const SERVER_SNAPSHOT: Snapshot = { hydrated: false, preferences: null };
let clientSnapshot: Snapshot = SERVER_SNAPSHOT;
let listeners: Array<() => void> = [];

function emitChange() {
  clientSnapshot = { hydrated: true, preferences: readStoredPreferences() };
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners = [...listeners, listener];
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}

function getClientSnapshot(): Snapshot {
  return clientSnapshot;
}

function getServerSnapshot(): Snapshot {
  return SERVER_SNAPSHOT;
}

if (typeof window !== "undefined") {
  clientSnapshot = { hydrated: true, preferences: readStoredPreferences() };
  window.addEventListener("storage", (event) => {
    if (event.key === COOKIE_CONSENT_KEY) emitChange();
  });
}

function writeStoredPreferences(prefs: CookiePreferences) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(prefs));
  } catch {
    // Ignore storage quota / private mode errors
  }
  emitChange();
}

export function CookieConsentProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { hydrated, preferences } = useSyncExternalStore(
    subscribe,
    getClientSnapshot,
    getServerSnapshot,
  );
  const [preferencesOpen, setPreferencesOpen] = useState(false);

  const persist = useCallback((externalMedia: boolean) => {
    const next: CookiePreferences = {
      necessary: true,
      externalMedia,
      updatedAt: new Date().toISOString(),
      version: "1.0",
    };
    writeStoredPreferences(next);
    setPreferencesOpen(false);
  }, []);

  const acceptAll = useCallback(() => persist(true), [persist]);
  const rejectNonEssential = useCallback(() => persist(false), [persist]);
  const savePreferences = useCallback(
    ({ externalMedia }: { externalMedia: boolean }) => persist(externalMedia),
    [persist],
  );
  const openPreferences = useCallback(() => setPreferencesOpen(true), []);
  const closePreferences = useCallback(() => setPreferencesOpen(false), []);

  const value = useMemo<CookieConsentContextValue>(
    () => ({
      preferences,
      hydrated,
      preferencesOpen,
      acceptAll,
      rejectNonEssential,
      savePreferences,
      openPreferences,
      closePreferences,
    }),
    [
      preferences,
      hydrated,
      preferencesOpen,
      acceptAll,
      rejectNonEssential,
      savePreferences,
      openPreferences,
      closePreferences,
    ],
  );

  return (
    <CookieConsentContext.Provider value={value}>
      {children}
    </CookieConsentContext.Provider>
  );
}

export function useCookieConsent() {
  const ctx = useContext(CookieConsentContext);
  if (!ctx) {
    throw new Error("useCookieConsent must be used within CookieConsentProvider");
  }
  return ctx;
}
