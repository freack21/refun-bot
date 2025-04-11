import AutoWA, { IWAutoMessageReceived } from "whatsauto.js";
import Command from "../command/base";
import CommandHandler from "../command/handler";
import FundayBOT from "../FundayBOT";
import { Sentence } from "../data/lang";
import { WAMessage } from "@whiskeysockets/baileys";

export type ParamValue = string | Buffer | boolean | number | null;
export interface ParamSchema {
  required: boolean;
  description: Sentence;
  value: () => Promise<ParamValue>;
  default: ParamValue;
  example?: string;
  type?: Sentence;
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

export type ConfigValue = string | boolean | number | (() => ConfigValue);

export type ConfigShema = Record<string, ConfigValue>;
export type UserConfigShema = Record<string, ConfigShema>;

export interface ExpectAnswers {
  msg: WAMessage;
  answers: string[];
  reward: number;
  right_msg: string;
  a_07_msg: string;
  a_05_msg: string;
  wrong_msg: string;
  timeout_msg: string;
  duration: number;
  createdAt: number;
}
