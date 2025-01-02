const Command = require("./base");
const fs = require("fs");
const axios = require("axios");

class QuickChat extends Command {
  aliases = ["qc", "quickchat"];
  description = "Make a QuickChat sticker.";
  name = "QuickChat";
  params = {
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

  constructor(autoWA, msg, args) {
    super(autoWA, msg, args);
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
      await this.autoWA.sendSticker({
        to: this.msg.from,
        filePath,
        answering: this.msg,
      });
    } catch (error) {
      await this.sendExecutionError();
    }
  }
}

module.exports = QuickChat;
