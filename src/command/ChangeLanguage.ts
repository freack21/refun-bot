import AutoWA, { WAutoMessageComplete } from "whatsauto.js";
import Command from "./base";
import CommandHandler from "./handler";
import { _languages_, Language } from "../data/lang";
import FundayBOT from "../FundayBOT";

export default class CommandChild extends Command {
  aliases = ["clang", "cl"];
  name = {
    en: "Change Language",
    id: "Ubah Bahasa",
  };
  description = {
    id: "Ubah preferensi bahasa yang digunakan bot",
    en: "Change the language preferences used by the bot",
  };

  constructor(
    autoWA: AutoWA,
    msg: WAutoMessageComplete,
    args: string[],
    commandHandler: CommandHandler,
    fundayBOT: FundayBOT
  ) {
    super(autoWA, msg, args, commandHandler, fundayBOT);

    this.errorExplanation = this.getSentence("args_not_valid");
    this.expectedArgs = _languages_.map((d) => "`" + d + "`").join(", ");

    this.params = {
      lang: {
        required: true,
        description: {
          en: "Language code you want to choose as preference",
          id: "Kode bahasa yang ingin kamu pilih sebagai preferensi",
        },
        example: "id",
        value: async () => {
          return args[0];
        },
        validate: async () => {
          const lang = await this.params.lang.value();
          return typeof lang == "string" && this.isValidLanguage(lang);
        },
        default: null,
      },
    };
  }

  isValidLanguage(lang: string): lang is Language {
    return _languages_.includes(lang as Language);
  }

  async execute(): Promise<void> {
    const param_lang = await this.getParamValue("lang");

    this.setUserConfig("lang", param_lang as Language);

    await this.msg.replyWithText(this.getSentence("success_ChangeLanguage"));
  }
}
