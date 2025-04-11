import AutoWA, { WAutoMessageComplete } from "whatsauto.js";
import Command from "./base";
import CommandHandler from "./handler";
import FundayBOT from "../FundayBOT";

export default class CommandChild extends Command {
  aliases = ["ping"];
  name = {
    en: "Ping",
    id: "Ping",
  };

  constructor(
    autoWA: AutoWA,
    msg: WAutoMessageComplete,
    args: string[],
    commandHandler: CommandHandler,
    fundayBOT: FundayBOT
  ) {
    super(autoWA, msg, args, commandHandler, fundayBOT);
  }

  async execute() {
    await this.msg.replyWithText("Pong!");
  }
}
