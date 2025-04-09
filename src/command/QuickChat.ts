import AutoWA, { WAutoMessageComplete } from "whatsauto.js";
import Command from "./base";
import CommandHandler from "./handler";
import axios from "axios";
import * as fs from "fs";
import FundayBOT from "../FundayBOT";

export default class QuickChat extends Command {
  hide = true;
  aliases = ["qc", "quickchat"];
  description = {
    id: "Membuat stiker QuickChat",
    en: "Make a QuickChat sticker",
  };
  name = "QuickChat";

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
        type: "string",
        description: "The message you want to put in QuickChat",
        example: "Hello, World!",
        value: null,
      },
      name: {
        required: false,
        type: "string",
        description: "The name you want to put in QuickChat",
        example: "John Doe",
        value: "WhatsAuto.js",
      },
      imgUrl: {
        required: false,
        type: "string",
        description: "The image URL you want to put in QuickChat avatar",
        example: "https://example.com/image.jpg",
        value: null,
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

    [this.params.msg.value, this.params.name.value, this.params.imgUrl.value] =
      this.args;

    for (const key in this.params) {
      if (this.params[key].required && !this.params[key].value) {
        await this.sendValidationError();
        return;
      }
    }

    try {
      const response = await axios.get("https://dhti.freack21.web.id/path/qc", {
        params: {
          msg: this.params.msg.value,
          img: this.params.imgUrl || img,
          name: this.params.name.value || this.msg.pushName,
        },
      });

      const response_ = await axios.get(response.data.link, {
        responseType: "arraybuffer",
      });

      const filePath = `${Date.now() + Math.random() * 1000}.png`;
      fs.writeFileSync(filePath, response_.data);
      await this.msg.replyWithSticker({
        filePath,
      });
    } catch (error) {
      await this.sendExecutionError();
    }
  }
}
