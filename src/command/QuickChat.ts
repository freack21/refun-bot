import AutoWA, { AutoWAError, WAutoMessageComplete } from "whatsauto.js";
import Command from "./base";
import CommandHandler from "./handler";
import axios from "axios";
import FundayBOT from "../FundayBOT";
import { _groups_ } from "../data/lang";

export default class CommandChild extends Command {
  hide = true;
  aliases = ["qc", "quickchat"];
  description = {
    id: "Membuat stiker QuickChat",
    en: "Make a QuickChat sticker",
  };
  name = {
    en: "QuickChat",
    id: "QuickChat",
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

    this.params = {
      msg: {
        required: true,
        description: {
          en: "The message you want to put in QuickChat",
          id: "Pesan yang ingin kamu masukkan ke Quickchat",
        },
        example: "Hello, World!",
        value: async () => args[0],
        default: "",
      },
      name: {
        required: false,
        description: {
          en: "The name you want to put in QuickChat",
          id: "Nama yang ingin kamu masukkan ke Quickchat",
        },
        example: "John Doe",
        value: async () => args[1],
        default: this.getBOT().getName(),
      },
      imgUrl: {
        required: false,
        description: {
          en: "The image URL you want to put in QuickChat avatar",
          id: "URL gambar yang ingin kamu masukkan ke Avatar Quickchat",
        },
        example: "https://example.com/image.jpg",
        value: async () => args[2],
        default: "",
      },
    };
  }

  async downloadProfile() {
    try {
      return await this.autoWA.sock.profilePictureUrl(this.msg.author, "image");
    } catch (error) {
      return null;
    }
  }

  async execute() {
    const img = await this.downloadProfile();

    try {
      const param_msg = await this.getParamValue("msg");
      const param_name = await this.getParamValue("name");
      const response = await axios.get("https://dhti.freack21.web.id/path/qc", {
        params: {
          msg: param_msg,
          img: this.params.imgUrl || img,
          name: param_name || this.msg.pushName,
        },
      });

      const response_ = await axios.get(response.data.link, {
        responseType: "arraybuffer",
      });

      await this.msg.replyWithSticker(Buffer.from(response_.data));
    } catch (error) {
      this.errorExplanation = this.getSentence("qc_server_error");
      await this.sendExecutionError();
    }
  }
}
