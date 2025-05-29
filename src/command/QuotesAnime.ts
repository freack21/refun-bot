import AutoWA, { AutoWAError, IWAutoMessage } from "whatsauto.js";
import Command from "./base";
import CommandHandler from "./handler";
import FundayBOT from "../FundayBOT";
import axios from "axios";
import { _groups_, Language } from "../data/lang";

export default class CommandChild extends Command {
  aliases = ["qanime", "quotesanime"];
  name = {
    en: "Anime Quotes",
    id: "Quotes Anime",
  };
  description = {
    id: "Dapetin quotes anime keren secara acak",
    en: "Get a random cool anime quotes",
  };
  group = _groups_["knowledge"];

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
      const { data: data_list_anime } = await axios.get(
        "https://katanime.vercel.app/api/getlistanime"
      );
      const my_anime: Record<string, string | number> = this.pickRandom(
        data_list_anime.result
      );
      const { data: data_quotes } = await axios.get(
        `https://katanime.vercel.app/api/getbyanime?anime=${
          my_anime["anime"]
        }&page=${this.getRandomInt(
          1,
          Math.ceil((my_anime["totalKata"] as number) / 15)
        )}`
      );
      if (data_quotes?.sukses) {
        const my_quotes: Record<string, string | number> = this.pickRandom(
          data_quotes.result
        );

        await this.msg.replyWithText(
          await this.getSentence("qanime_result", {
            char: my_quotes["character"],
            anime: my_quotes["anime"],
            q_id: my_quotes["indo"],
            q_en: my_quotes["english"],
          })
        );
      } else
        await this.msg.replyWithText(
          await this.getSentence("qanime_empty_msg")
        );
    } catch (err) {
      this.errorExplanation = await this.getSentence("qanime_server_err");
      await this.sendExecutionError();
    }
  }
}
