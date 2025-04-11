import fs from "fs";

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
} as const;

const getSentences: () => Sentences = () => {
  const _sentences = fs.readFileSync("./database/sentences.json", {
    encoding: "utf-8",
  });
  return JSON.parse(_sentences);
};

export default getSentences;
