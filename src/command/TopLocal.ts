import AutoWA, { phoneToJid, WAutoMessageComplete } from "whatsauto.js";
import Command from "./base";
import CommandHandler from "./handler";
import FundayBOT from "../FundayBOT";
import { UserPoint } from "../types";

export default class CommandChild extends Command {
  aliases = ["toplocal", "topl", "lb"];
  name = {
    id: "Leaderboard Lokal",
    en: "Local Leaderboard",
  };
  description = {
    en: "See the leaderboard on this room chat",
    id: "Lihat leaderboard pada roomchat ini",
  };
  public mustBeGroup: boolean = true;

  constructor(
    autoWA: AutoWA,
    msg: WAutoMessageComplete,
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
      if (this.msg.from in groupPoint) {
        leaderboard.push({
          user,
          point: groupPoint[this.msg.from],
        });
      }
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

    const text = this.getSentence("lb", {
      lb,
    });

    await this.msg.replyWithText(text, {
      mentions,
    });
  }
}
