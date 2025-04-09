import AutoWA, { phoneToJid, WAutoMessageComplete } from "whatsauto.js";
import Command from "./base";
import CommandHandler from "./handler";
import FundayBOT from "../FundayBOT";

export default class Menu extends Command {
  aliases = ["menu", "ls"];
  name = "Menu";
  description = {
    id: "Melihat daftar perintah / fitur yang ada di bot",
    en: "See the list of commands / features in the bot",
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

  async getListCommand(): Promise<Record<string, string[]>> {
    const handlers = await this.commandHandler.handlers();

    const grouped: Record<string, string[]> = {};

    handlers
      .filter((handler) => !handler.hide)
      .forEach((handler) => {
        const group = handler.group || "Other";

        const line = this.getSentence("menulist")
          .replace("{name}", handler.name)
          .replace(
            "{desc}",
            handler.description[this.getBOT().getLanguage()]
              ? "| " + handler.description[this.getBOT().getLanguage()]
              : ""
          )
          .replace(
            "{alias}",
            handler.aliases.map((d) => "`" + d + "`").join(", ")
          );

        if (!grouped[group]) grouped[group] = [];
        grouped[group].push(line);
      });

    return grouped;
  }

  async execute() {
    const groupedCommands = await this.getListCommand();

    let menu = Object.entries(groupedCommands)
      .map(([group, commands]) => {
        return `📂 *${group}*\n${commands.join("\n")}`;
      })
      .join("\n\n");

    const text = this.getSentence("menu")
      .replace(
        "{user}",
        phoneToJid({
          to: this.msg.author,
          reverse: true,
        })
      )
      .replace("{menu}", menu);

    await this.msg.replyWithText(text, { mentions: [this.msg.author] });
  }
}
