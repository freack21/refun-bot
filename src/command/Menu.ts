import AutoWA, { WAutoMessageComplete } from "whatsauto.js";
import Command from "./base";
import CommandHandler from "./handler";

export default class Menu extends Command {
  aliases = ["menu", "ls"];
  name = "Menu";

  constructor(
    autoWA: AutoWA,
    msg: WAutoMessageComplete,
    args: string[],
    commandHandler: CommandHandler
  ) {
    super(autoWA, msg, args, commandHandler);
  }

  async getListCommand() {
    return (await this.commandHandler.handlers())
      .filter((handler) => !handler.hide)
      .map((handler) => {
        return `*${handler.name}* - ${
          handler.description || "no description provided"
        }, _e.g._: ${handler.aliases.join(", ")}`;
      });
  }

  async execute() {
    const listCommand = await this.getListCommand();
    let menu = `*List Command:*\n=\n${listCommand.join("\n-\n")}`;

    await this.msg.replyWithText(menu);
  }
}
