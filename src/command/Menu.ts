import AutoWA, { phoneToJid, WAutoMessageComplete } from "whatsauto.js";
import Command from "./base";
import CommandHandler from "./handler";
import FundayBOT from "../FundayBOT";

export default class CommandChild extends Command {
  aliases = ["menu", "ls"];
  name = {
    en: "Menu",
    id: "Menu",
  };
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

  async getListCommand(handlers: Command[]): Promise<Record<string, string[]>> {
    const grouped: Record<string, string[]> = {};
    const lang = this.getLang();

    const tierIcon: Record<number, string> = {
      1: "⭐",
      2: "🌟",
    };

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
          name: handler.name[lang],
          desc: handler.description[lang]
            ? "| " + handler.description[lang]
            : "",
          alias: handler.aliases.map((d) => "`" + d + "`").join(", "),
          icon: tierIcon[handler.tier] || "🔸",
        });

        if (!grouped[group]) grouped[group] = [];
        grouped[group].push(line);
      });

    return grouped;
  }

  async execute() {
    const handlers = await this.commandHandler.handlers();

    const groupedCommands = await this.getListCommand(handlers);

    let menu = Object.entries(groupedCommands)
      .map(([group, commands]) => {
        return `📂 *${group.toUpperCase()}*\n${commands.join("\n")}`;
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
      cmd_count: handlers.length,
      user_tier: (this.getUserConfig("tier") as number) || 0,
      user_limit: this.getUserConfig("limit") as number,
      user_nick: this.getUserConfig("nick") as number,
    });

    await this.msg.replyWithText(text, { mentions: [this.msg.author] });
  }
}
