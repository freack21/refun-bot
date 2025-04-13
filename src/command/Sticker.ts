import AutoWA, { WAutoMessageComplete } from "whatsauto.js";
import Command from "./base";
import CommandHandler from "./handler";
import FundayBOT from "../FundayBOT";
import { _groups_ } from "../data/lang";

export default class CommandChild extends Command {
  aliases = ["s", "sticker", "stiker"];
  name = {
    en: "Sticker",
    id: "Stiker",
  };
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
      type: {
        en: "image / video",
        id: "gambar / video",
      },
      example: "send or reply to an image or video.",
      value: async () => {
        const [sticker, hasMedia] = await this.msg.toSticker({
          author: "@fundaybot_",
          pack: "sticker",
        });
        if (!hasMedia) return undefined;
        return sticker;
      },
      default: null,
    },
  };
  group = _groups_["utility"];
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
    const param_media = await this.getParamValue("media");

    await this.msg.replyWithSticker(param_media as Buffer, {
      failMsg: this.getSentence("sticker_error"),
    });
  }
}
