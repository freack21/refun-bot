import AutoWA, { phoneToJid, WAutoMessageComplete } from "whatsauto.js";
import Command from "./base";
import CommandHandler from "./handler";
import FundayBOT from "../FundayBOT";
import { Language } from "../data/lang";

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
    const lang = this.getConfig("lang") as Language;

    handlers
      .filter((handler) => !handler.hide)
      .forEach((handler) => {
        const group =
          handler.group[lang] ||
          {
            en: "Other",
            id: "Lainnya",
          }[lang];

        const line = this.getSentence("menulist", {
          name: handler.name,
          desc: handler.description[this.getConfig("lang") as Language]
            ? "| " + handler.description[this.getConfig("lang") as Language]
            : "",
          alias: handler.aliases.map((d) => "`" + d + "`").join(", "),
          icon: handler.premium ? "⭐" : "🔸",
        });

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

    const text = this.getSentence("menu", {
      user: phoneToJid({
        from: this.msg.author,
        reverse: true,
      }),
      menu,
      bot_name: this.getBOT().getName(),
      user_name: this.msg.pushName || "",
    });

    await this.msg.replyWithText(text, { mentions: [this.msg.author] });
  }
}
