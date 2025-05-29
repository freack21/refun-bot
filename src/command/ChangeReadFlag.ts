import AutoWA, { IWAutoMessage } from "whatsauto.js";
import Command from "./base";
import CommandHandler from "./handler";
import { _groups_, _languages_, Language, Sentence } from "../data/lang";
import FundayBOT from "../FundayBOT";

export default class CommandChild extends Command {
  aliases = ["cread", "cr"];
  name = {
    en: "Change Read Flage",
    id: "Ubah Bahasa",
  };
  description = {
    id: "Ubah preferensi bahasa yang digunakan bot",
    en: "Change the language preferences used by the bot",
  };
  public adminOnly: boolean = true;
  public group: Sentence = _groups_["admin"];

  params = {
    flag: {
      required: false,
      description: {
        en: "Read flag, fill it with some char and read flag will be on",
        id: "Tanda baca, isi dengan sembarang karakter maka tanda baca akan hidup",
      },
      example: "✅",
      value: async () => {
        return this.args[0];
      },
      default: null,
    },
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

  isValidLanguage(lang: string): lang is Language {
    return _languages_.includes(lang as Language);
  }

  async execute(): Promise<void> {
    const param_flag = await this.getParamValue("flag");

    await this.setConfig("reading", param_flag != 0);

    await this.msg.replyWithText(
      await this.getSentence("success_ChangeLanguage")
    );
  }
}
