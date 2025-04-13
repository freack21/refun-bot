import fs from "fs";
import { join } from "path";

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

const getSentences: (txt?: string) => Sentences | string = (txt) => {
  if (txt) {
    try {
      return fs.readFileSync(join(__dirname, `../../database/${txt}.txt`), {
        encoding: "utf-8",
      });
    } catch (error) {
      return "";
    }
  }
  try {
    const _sentences = fs.readFileSync(
      join(__dirname, "../../database/sentences.json"),
      {
        encoding: "utf-8",
      }
    );
    return JSON.parse(_sentences);
  } catch (error) {
    return {};
  }
};

export default getSentences;
