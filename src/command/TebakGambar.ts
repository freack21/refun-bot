import AutoWA, { WAutoMessageComplete } from "whatsauto.js";
import Command from "./base";
import CommandHandler from "./handler";
import FundayBOT from "../FundayBOT";
import axios from "axios";
import * as cheerio from "cheerio";
import { _groups_ } from "../data/lang";

export default class CommandChild extends Command {
  aliases = ["tg", "tebakgambar", "gtp"];
  name = {
    en: "Guess The Picture",
    id: "Tebak Gambar",
  };
  description = {
    id: "Main game tebak gambar",
    en: "Play guess the picture game",
  };
  group = _groups_["games"];
  public cost: number = 1;

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
    if (await this.isAlreadyStarted()) return;

    try {
      const { data: page_all_answers } = await axios.get(
        "https://jawabantebakgambar.net/all-answers/"
      );
      const $ = cheerio.load(page_all_answers);
      const quests = $("#images li");
      const id = this.getRandomInt(1, quests.length);
      const quest = $(`#images li:nth-child(${id})`);

      const imgUrl =
        "https://jawabantebakgambar.net" + quest.find("img.lazy").data("src");
      const answer = quest.find("span").text().toLowerCase();

      if (!answer) {
        this.errorExplanation = this.getSentence("tgs_empty_msg");
        await this.sendExecutionError();
        return;
      }
      const reward = this.getRandomInt(20, 50);
      const duration = 60;

      const questMsg = await this.msg.replyWithImage(imgUrl, {
        text: this.getSentence("tg_result", {
          reward,
          duration,
        }),
      });

      this.setUnAnsweredMsg(questMsg, [answer], reward, 60);
    } catch (err) {
      this.errorExplanation = this.getSentence("tgs_server_err");
      await this.sendExecutionError();
    }
  }
}
