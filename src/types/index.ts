import AutoWA, { IWAutoMessageReceived } from "whatsauto.js";
import Command from "../command/base";
import CommandHandler from "../command/handler";
import FundayBOT from "../FundayBOT";
import { Sentence } from "../data/lang";
import { WAMessage } from "@whiskeysockets/baileys";

export const _tierlist_ = [
  "warrior",
  "elite",
  "master",
  "epic",
  "legend",
] as const;

export const _limitlist_ = [10, 50, 100, 250, 500] as const;

export type UserTierData = Record<
  "user" | "tier" | "duration" | "limit",
  string | number
>;

export type TypeDataParam = "object" | "array" | "single";

export type ParamValue =
  | string
  | Buffer
  | boolean
  | number
  | UserTierData
  | UserTierData[]
  | null
  | undefined;

export interface ParamSchema {
  required: boolean;
  description: Sentence;
  value: () => Promise<ParamValue>;
  default: ParamValue;
  example?: string;
  type?: Sentence;
  typedata?: TypeDataParam;
  validate?: () => Promise<boolean>;
}

export interface CommandConstructor {
  new (
    autoWA: AutoWA,
    msg: IWAutoMessageReceived,
    args: string[],
    handler: CommandHandler,
    fundayBOT: FundayBOT
  ): Command;
}

export type CommandMessage = "error" | "validation" | "error_cause";

export type UserPoint = Record<string, number>;

export type ConfigCallableValue = (user?: string) => ConfigValue;
export type ConfigValue =
  | string
  | string[]
  | boolean
  | number
  | ConfigCallableValue
  | UserPoint;

export type ConfigShema = Record<string, ConfigValue>;
export type UserConfigShema = Record<string, ConfigShema>;

export interface ExpectAnswers {
  answers: string[];
  reward?: number;
  right_msg: string;
  a_07_msg: string;
  a_05_msg: string;
  wrong_msg: string;
  timeout_msg: string;
  duration: number;
  msg: WAMessage;
  createdAt: number;
}
