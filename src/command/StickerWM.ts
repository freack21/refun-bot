import AutoWA, { WAutoMessageComplete } from "whatsauto.js";
import Command from "./base";
import CommandHandler from "./handler";
import FundayBOT from "../FundayBOT";
import { _groups_ } from "../data/lang";

export default class CommandChild extends Command {
  public tier: number = 1;
  aliases = ["swm", "stickerwm", "stikerwm"];
  name = {
    en: "Sticker + WM",
    id: "Stiker + WM",
  };
  description = {
    id: "Buat stiker dari gambar atau video dengan menambahkan deskripsi stiker sendiri (watermark)",
    en: "Create a sticker from an image or video by adding a description of your own sticker (watermark)",
  };
  params = {
    author: {
      required: true,
      description: {
        en: "The name of the sticker maker",
        id: "Nama pembuat stiker",
      },
      example: "@fundaybot",
      value: async () => this.args[0],
      default: null,
    },
    pack: {
      required: false,
      description: {
        en: "Sticker package name",
        id: "Nama paket stiker",
      },
      example: "Fun Stickers",
      value: async () => this.args[1],
      default: "sticker",
    },
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
      value: async () => {
        const [sticker, hasMedia] = await this.msg.toSticker({
          author: (await this.getParamValue("author")) as string,
          pack: (await this.getParamValue("pack")) as string,
        });
        if (!hasMedia) return undefined;
        return sticker;
      },
      default: null,
    },
  };
  group = _groups_["utility"];
  public cost: number = 2;

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
