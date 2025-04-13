import AutoWA, { IWAutoMessage } from "whatsauto.js";
import Command from "./base";
import CommandHandler from "./handler";
import FundayBOT from "../FundayBOT";

export default class CommandChild extends Command {
  public hide: boolean = true;
  aliases = ["ping"];
  name = {
    en: "Ping",
    id: "Ping",
  };

  constructor(
    autoWA: AutoWA,
    msg: IWAutoMessage,
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
