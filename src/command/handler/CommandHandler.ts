import AutoWA, { IWAutoMessage } from "whatsauto.js";
import path from "path";
import fs from "fs";
import Command from "../base";
import { CommandConstructor } from "../../types";
import FundayBOT from "../../FundayBOT";

export default class CommandHandler {
  private autoWA: AutoWA;
  private msg: IWAutoMessage;
  private args: string[];
  private fundayBOT: FundayBOT;

  constructor(
    autoWA: AutoWA,
    msg: IWAutoMessage,
    args: string[],
    fundayBOT: FundayBOT
  ) {
    this.autoWA = autoWA;
    this.msg = msg;
    this.args = args;
    this.fundayBOT = fundayBOT;
  }

  getHandlerFiles() {
    return fs
      .readdirSync(path.join(__dirname, "../"))
      .filter(
        (file) =>
          file.endsWith(".js") ||
          (file.endsWith(".ts") && file !== "index.js" && file !== "index.ts")
      );
  }

  async handlers(): Promise<Command[]> {
    const handlers = await Promise.all(
      this.getHandlerFiles().map(async (file) => {
        const modulePath = path.join(__dirname, "..", file);
        const handlerModule = await import(modulePath);
        const HandlerClass = handlerModule.default as CommandConstructor;
        return new HandlerClass(
          this.autoWA,
          this.msg,
          this.args,
          this,
          this.getBOT()
        );
      })
    );
    return handlers;
  }

  getBOT() {
    return this.fundayBOT;
  }
}
