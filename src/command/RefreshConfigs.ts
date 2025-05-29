import AutoWA, { IWAutoMessage } from "whatsauto.js";
import Command from "./base";
import CommandHandler from "./handler";
import { _groups_, Sentence, setSentences } from "../data/lang";
import FundayBOT from "../FundayBOT";

export default class CommandChild extends Command {
  aliases = ["refresh", "rconfig"];
  name = {
    en: "Refresh BOT Configs",
    id: "Refresh Konfigurasi BOT",
  };
  description = {
    id: "Muat ulang konfigurasi bot",
    en: "Refresh bot configs",
  };
  public adminOnly: boolean = true;
  public group: Sentence = _groups_["admin"];

  constructor(
    autoWA: AutoWA,
    msg: IWAutoMessage,
    args: string[],
    commandHandler: CommandHandler,
    fundayBOT: FundayBOT
  ) {
    super(autoWA, msg, args, commandHandler, fundayBOT);
  }

  async execute(): Promise<void> {
    await setSentences();
    await this.getBOT().setConfigs();
    await this.getBOT().setUserConfigs();

    await this.msg.replyWithText("✅");
  }
}
