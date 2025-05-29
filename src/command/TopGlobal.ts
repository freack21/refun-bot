import AutoWA, { phoneToJid, IWAutoMessage } from "whatsauto.js";
import Command from "./base";
import CommandHandler from "./handler";
import FundayBOT from "../FundayBOT";
import { UserPoint } from "../types";

export default class CommandChild extends Command {
  aliases = ["topglobal", "topg", "glb"];
  name = {
    id: "Leaderboard Global",
    en: "Global Leaderboard",
  };
  description = {
    en: "See the global leaderboard on this bot",
    id: "Lihat leaderboard global pada bot ini",
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

  getLeaderboard() {
    const full_data = this.getBOT().getUserConfigs();
    let leaderboard = [];

    for (const [user, data] of Object.entries(full_data)) {
      const groupPoint = data["group_point"] as UserPoint;
      let _point = 0;
      for (const [_, point] of Object.entries(groupPoint)) {
        _point += point;
      }
      leaderboard.push({
        user,
        point: _point,
      });
    }

    leaderboard.sort((a, b) => b.point - a.point);
    return leaderboard;
  }

  async execute() {
    const medals = ["🥇", "🥈", "🥉"];
    const mentions: string[] = [];
    const lb = this.getLeaderboard()
      .map((data, idx) => {
        mentions.push(data.user);
        return this.getSentence("lb_line", {
          no: medals[idx] || idx + 1 + ".",
          user: phoneToJid({ from: data.user, reverse: true }),
          point: data.point,
        });
      })
      .join("\n");

    const text = await this.getSentence("glb", {
      lb,
    });

    await this.msg.replyWithText(text, {
      mentions,
    });
  }
}
