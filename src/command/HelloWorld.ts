import AutoWA, { WAutoMessageComplete } from "whatsauto.js";
import Command from "./base";
import CommandHandler from "./handler";
import FundayBOT from "../FundayBOT";

export default class CommandChild extends Command {
  public hide: boolean = true;
  aliases = ["helloworld"];
  name = {
    en: "Hello World!",
    id: "Hello World!",
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
    const admins = this.getConfig("admin") as string[];
    for (const admin of admins) {
      await this.autoWA.sendText({
        to: admin,
        text: "Hello World!",
      });
    }
  }
}
