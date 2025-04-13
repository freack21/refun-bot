import AutoWA, { phoneToJid, IWAutoMessage } from "whatsauto.js";
import Command from "./base";
import CommandHandler from "./handler";
import FundayBOT from "../FundayBOT";
import { _tierlist_ } from "../types";

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
    msg: IWAutoMessage,
    args: string[],
    commandHandler: CommandHandler,
    fundayBOT: FundayBOT
  ) {
    super(autoWA, msg, args, commandHandler, fundayBOT);
  }

  async getListCommand(handlers: Command[]): Promise<Record<string, string[]>> {
    const groupedCommands: Record<string, string[]> = {};
    const lang = this.getLang();

    const tierIcon: Record<number, string> = {
      1: "⭐",
      2: "🌟",
    };

    handlers
      .filter((handler) => {
        if (!this.isAdmin()) return !handler.hide && !handler.adminOnly;
        return !handler.hide;
      })
      .forEach((handler) => {
        const group =
          handler.group[lang] ||
          {
            en: "Other",
            id: "Lainnya",
          }[lang];

        let line = "";
        if (handler.cost)
          line = this.getSentence("menulist_cost", {
            name: handler.name[lang],
            desc: handler.description[lang]
              ? "| " + handler.description[lang]
              : "",
            alias: handler.aliases.map((d) => "`" + d + "`").join(", "),
            icon: handler.adminOnly ? "💫" : tierIcon[handler.tier] || "🔸",
            cost: handler.cost,
          });
        else
          line = this.getSentence("menulist", {
            name: handler.name[lang],
            desc: handler.description[lang]
              ? "| " + handler.description[lang]
              : "",
            alias: handler.aliases.map((d) => "`" + d + "`").join(", "),
            icon: handler.adminOnly ? "💫" : tierIcon[handler.tier] || "🔸",
          });

        if (!groupedCommands[group]) groupedCommands[group] = [];
        groupedCommands[group].push(line);
      });

    return groupedCommands;
  }

  async execute() {
    const handlers = await this.commandHandler.handlers();

    const groupedCommands = await this.getListCommand(handlers);

    let menu = Object.entries(groupedCommands)
      .sort((a, b) => a[0].toLowerCase().localeCompare(b[0].toLowerCase()))
      .map(([group, commands]) => {
        return `📂 *${group.toUpperCase()}*\n${commands.join("\n")}`;
      })
      .join("\n\n");

    const userTier = this.getUserTierData();

    const text = this.getTxt("menu", {
      user: phoneToJid({
        from: this.msg.author,
        reverse: true,
      }),
      menu,
      bot_name: this.getBOT().getName(),
      user_name: this.msg.pushName || "",
      cmd_count: handlers.filter((handler) => !handler.hide).length,
      user_tier: _tierlist_[userTier.tier as number],
      user_tier_duration: Math.ceil(
        ((userTier.duration as number) - Date.now()) / (1000 * 60 * 60 * 24)
      ),
      user_limit: this.getUserLimit(),
      user_nick: this.getUserConfig("nick") as string,
    });

    await this.msg.replyWithText(text, { mentions: [this.msg.author] });
  }
}
