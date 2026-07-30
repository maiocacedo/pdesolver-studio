import { create } from "zustand";
import { messages, type Lang, type MsgKey } from "./messages";

const LANG_KEY = "pde-lang";

function initialLang(): Lang {
  const saved = typeof localStorage !== "undefined" ? localStorage.getItem(LANG_KEY) : null;
  return saved === "en" ? "en" : "pt";
}

interface I18nStore {
  lang: Lang;
  setLang: (lang: Lang) => void;
}

export const useI18n = create<I18nStore>((set) => ({
  lang: initialLang(),
  setLang: (lang) => {
    if (typeof localStorage !== "undefined") {
      try { localStorage.setItem(LANG_KEY, lang); } catch { /* ignore */ }
    }
    set({ lang });
  },
}));

function translate(lang: Lang, key: MsgKey, vars?: Record<string, string | number>): string {
  let s: string = messages[lang][key] ?? messages.pt[key] ?? key;
  if (vars) for (const k in vars) s = s.replace(`{${k}}`, String(vars[k]));
  return s;
}

/**
 * Imperative translator that reads the current language. For non-React code
 * (event handlers, toast messages) that can't use the hook.
 */
export function t(key: MsgKey, vars?: Record<string, string | number>): string {
  return translate(useI18n.getState().lang, key, vars);
}

/** Hook for components — re-renders when the language changes. */
export function useT() {
  const lang = useI18n((s) => s.lang);
  const setLang = useI18n((s) => s.setLang);
  return {
    lang,
    setLang,
    t: (key: MsgKey, vars?: Record<string, string | number>) => translate(lang, key, vars),
  };
}
