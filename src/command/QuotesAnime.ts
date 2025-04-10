import AutoWA, { AutoWAError, WAutoMessageComplete } from "whatsauto.js";
import Command from "./base";
import CommandHandler from "./handler";
import FundayBOT from "../FundayBOT";
import axios from "axios";
import querystring from "querystring";
import { CommandGroupEn, CommandGroupId, Language } from "../data/lang";

export default class QuotesAnime extends Command {
  aliases = ["qanime", "quotesanime"];
  name = "Quotes Anime";
  description = {
    id: "Dapetin quotes anime keren secara acak",
    en: "Get a random cool anime quotes",
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
      const { data: data_list_anime } = await axios.get(
        "https://katanime.vercel.app/api/getlistanime"
      );
      const my_anime: Record<string, string | number> =
        this.getBOT().pickRandom(data_list_anime.result);
      const { data: data_quotes } = await axios.get(
        `https://katanime.vercel.app/api/getbyanime?anime=${
          my_anime["anime"]
        }&page=${this.getBOT().getRandomInt(
          1,
          Math.ceil((my_anime["totalKata"] as number) / 15)
        )}`
      );
      if (data_quotes?.sukses) {
        const my_quotes: Record<string, string | number> =
          this.getBOT().pickRandom(data_quotes.result);

        await this.msg.replyWithText(
          this.getSentence("qanime_result", {
            char: my_quotes["character"],
            anime: my_quotes["anime"],
            q_id: my_quotes["indo"],
            q_en: my_quotes["english"],
          })
        );
      } else await this.msg.replyWithText(this.getSentence("tgs_empty_msg"));
    } catch (err) {
      this.errorExplanation = this.getSentence("tgs_server_err");
      await this.sendExecutionError();
    }
  }
}
