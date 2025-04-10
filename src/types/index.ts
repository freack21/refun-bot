import AutoWA, { IWAutoMessageReceived } from "whatsauto.js";
import Command from "../command/base";
import CommandHandler from "../command/handler";
import FundayBOT from "../FundayBOT";
import { Language } from "../data/lang";

export type ParamValue = string | Buffer | boolean | number | null;
export interface ParamSchema {
  required: boolean;
  description: Record<Language, string>;
  value: () => Promise<ParamValue>;
  default: ParamValue;
  type?: "string" | "number";
  example?: string;
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

export type ConfigValue = string | boolean | number;

export type ConfigShema = Record<string, ConfigValue>;
