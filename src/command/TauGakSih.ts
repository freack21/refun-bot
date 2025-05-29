import AutoWA, { IWAutoMessage } from "whatsauto.js";
import Command from "./base";
import CommandHandler from "./handler";
import FundayBOT from "../FundayBOT";
import axios from "axios";
import { _groups_ } from "../data/lang";

export default class CommandChild extends Command {
  aliases = ["tgs", "taugaksih", "dyk", "didyouknow"];
  name = {
    en: "Did You Know",
    id: "Tau Gak Sih",
  };
  description = {
    id: "Dapetin fakta unik / menarik",
    en: "Get a unique / interesting facts",
  };
  group = _groups_["knowledge"];
  public cost: number = 1;
  public hide: boolean = true;

  constructor(
    autoWA: AutoWA,
    msg: IWAutoMessage,
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
          text: await this.getSentence("tgs_result", {
            msg: info,
          }),
        });
      } else
        await this.msg.replyWithText(await this.getSentence("tgs_empty_msg"));
    } catch (err) {
      this.errorExplanation = await this.getSentence("tgs_server_err");
      await this.sendExecutionError();
    }
  }
}
