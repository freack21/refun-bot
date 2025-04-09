import AutoWA, { WAutoMessageComplete } from "whatsauto.js";
import Command from "./base";
import CommandHandler from "./handler";
import { _languages_, Language } from "../data/lang";
import FundayBOT from "../FundayBOT";

export default class ChangeLanguage extends Command {
  aliases = ["clang", "cl"];
  name = "Change Language";
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
        description: "Language code you want to choose as preference",
        example: "id",
      },
    };
  }

  isValidLanguage(lang: string): lang is Language {
    return _languages_.includes(lang as Language);
  }

  async execute(): Promise<void> {
    if (!this.args[0]) return await this.sendValidationError();

    if (this.isValidLanguage(this.args[0])) {
      this.getBOT().setLanguage(this.args[0]);

      await this.msg.replyWithText(this.getSentence("success_ChangeLanguage"));
    } else await this.sendExecutionError(true);
  }
}
