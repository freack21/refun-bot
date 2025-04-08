import AutoWA, { WAutoMessageComplete } from "whatsauto.js";
import Command from "./base";
import CommandHandler from "./handler";

export default class Ping extends Command {
  aliases = ["ping"];
  name = "Ping";

  constructor(
    autoWA: AutoWA,
    msg: WAutoMessageComplete,
    args: string[],
    commandHandler: CommandHandler
  ) {
    super(autoWA, msg, args, commandHandler);
  }

  async execute() {
    await this.msg.replyWithText("Pong!");
  }
}
