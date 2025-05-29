import { DB } from "./firebase";

let _sentences_: Sentences;

export const _languages_ = ["en", "id"] as const;
export type Language = (typeof _languages_)[number];
export type Sentence = Record<Language, string>;
export type Sentences = Record<Language, Record<string, string>>;

export type Replacements = Record<string, string | number>;
export type CommandGroup =
  | "utility"
  | "general"
  | "ai"
  | "knowledge"
  | "games"
  | "admin"
  | "basic";

export const _groups_: Record<CommandGroup, Sentence> = {
  utility: {
    en: "Utility",
    id: "Utilitas",
  },
  general: {
    en: "General",
    id: "Umum",
  },
  games: {
    en: "Games",
    id: "Permainan",
  },
  ai: {
    en: "AI",
    id: "AI",
  },
  knowledge: {
    en: "Knowledge",
    id: "Pengetahuan",
  },
  basic: {
    en: "Basic",
    id: "Dasar",
  },
  admin: {
    en: "Administrator",
    id: "Administrator",
  },
} as const;

export const getSentence = async (
  idLang: Language,
  langKey: string
): Promise<string> => {
  return (await getSentences())[idLang][langKey] ?? langKey;
};

export const getSentences = async (): Promise<Sentences> => {
  return _sentences_;
};

export const setSentences = async (): Promise<Sentences> => {
  const result: Partial<Sentences> = {};

  await Promise.all(
    _languages_.map(async (lang) => {
      const snapshot = await DB.collection("sentences").doc(lang).get();
      result[lang] = snapshot.data() ?? {};
    })
  );

  _sentences_ = result as Sentences;
  return _sentences_;
};

export default getSentence;
