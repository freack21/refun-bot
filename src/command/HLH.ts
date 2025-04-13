import AutoWA, { WAutoMessageComplete } from "whatsauto.js";
import Command from "./base";
import CommandHandler from "./handler";
import FundayBOT from "../FundayBOT";
import { ParamSchema } from "../types";
import { _groups_ } from "../data/lang";

export default class CommandChild extends Command {
  aliases = ["hlh", "hilih", "halah", "huluh", "holoh", "heleh"];
  name = {
    en: "HLH",
    id: "HLH",
  };
  public description: Record<"en" | "id", string> = {
    id: "Membuat huruf vokal dalam teks yang kamu berikan akan hilang atau diganti",
    en: "Making vocal letters in the text you give will be lost or replaced",
  };
  public params: Record<string, ParamSchema> = {
    text: {
      required: true,
      default: null,
      value: async () =>
        this.args.length ? this.args.join("|") : this.msg.quotedMessage?.text,
      description: {
        id: "Teks yang akan diubah",
        en: "The text to be changed",
      },
      example: "Hello World",
    },
  };
  group = _groups_["utility"];

  constructor(
    autoWA: AutoWA,
    msg: WAutoMessageComplete,
    args: string[],
    commandHandler: CommandHandler,
    fundayBOT: FundayBOT
  ) {
    super(autoWA, msg, args, commandHandler, fundayBOT);
  }

  hlh(text: string, char: string) {
    text = text.replace(/[aeiou]/g, char);
    text = text.replace(/[AEIOU]/g, char.toUpperCase());
    return text;
  }

  async execute() {
    const param_text = await this.getParamValue("text");
    const vocalMap: Record<string, string> = {
      halah: "a",
      heleh: "e",
      hilih: "i",
      holoh: "o",
      huluh: "u",
      hlh: "",
    };

    await this.msg.replyWithText(
      this.hlh(param_text as string, vocalMap[this.getCommand() || "hlh"] || "")
    );
  }
}
