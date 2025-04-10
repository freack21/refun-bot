import AutoWA, { AutoWAError, WAutoMessageComplete } from "whatsauto.js";
import Command from "./base";
import CommandHandler from "./handler";
import FundayBOT from "../FundayBOT";
import axios from "axios";
import { CommandGroupEn, CommandGroupId, Language } from "../data/lang";

export default class TauGakSih extends Command {
  aliases = ["tgs", "taugaksih"];
  name = "Tau Gak Sih";
  description = {
    id: "Dapetin fakta unik / menarik",
    en: "Get a unique / interesting facts",
  };
  group: Record<Language, CommandGroupEn | CommandGroupId> = {
    en: "Knowledge",
    id: "Pengetahuan",
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
    try {
      const { data } = await axios.get(
        "https://cinnabar.icaksh.my.id/public/daily/tawiki"
      );
      if (data.data) {
        const info = (data.data.info as Array<Record<string, string>>)
          .map((data) => {
            return `ℹ️ ${data["tahukah_anda"]}`;
          })
          .join("\n\n");

        await this.msg.replyWithImage(data.data.image_link, {
          text: this.getSentence("tgs_result", {
            msg: info,
          }),
        });
      } else await this.msg.replyWithText(this.getSentence("tgs_empty_msg"));
    } catch (err) {
      this.errorExplanation = this.getSentence("tgs_server_err");
      await this.sendExecutionError();
    }
  }
}
