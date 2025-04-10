import AutoWA, { WAutoMessageComplete } from "whatsauto.js";
import Command from "./base";
import CommandHandler from "./handler";
import FundayBOT from "../FundayBOT";
import { CommandGroupEn, CommandGroupId, Language } from "../data/lang";

export default class Sticker extends Command {
  aliases = ["s", "sticker"];
  name = "Sticker";
  description = {
    id: "Buat stiker dari gambar atau video",
    en: "Make a sticker from an image or video",
  };
  params = {
    media: {
      required: true,
      description: {
        en: "The image or video you want to make a sticker",
        id: "Gambar atau video yang ingin kamu buat stiker",
      },
      example: "send or reply to an image or video.",
      value: async () =>
        await this.msg.toSticker({
          author: "@fundaybot_",
          pack: "sticker",
        }),
      default: null,
    },
  };
  group: Record<Language, CommandGroupEn | CommandGroupId> = {
    en: "Utility",
    id: "Utilitas",
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
    const param_media = await this.getParamValue("media");

    await this.msg.replyWithSticker(param_media as Buffer);
  }
}
