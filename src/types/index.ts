import AutoWA, { IWAutoMessageReceived } from "whatsauto.js";
import Command from "../command/base";
import CommandHandler from "../command/handler";
import FundayBOT from "../FundayBOT";

export interface ParamSchema {
  required: boolean;
  description: string;
  type?: "string" | "number";
  example: string;
  value?: string | null;
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
