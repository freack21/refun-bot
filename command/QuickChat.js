const Command = require("./base");
const fs = require("fs");
const axios = require("axios");

class QuickChat extends Command {
  aliases = ["qc", "quickchat"];

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
    if (this.args[0]) {
      try {
        const response = await axios.get(
          "https://dhti.freack21.web.id/path/qc",
          {
            params: {
              msg: this.args[0],
              img,
              name: this.msg.pushName,
            },
          }
        );
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
        await this.autoWA.sendText({
          to: this.msg.from,
          text: "Error while trying to make QuickChat image.",
          answering: this.msg,
        });
      }
    } else {
      await this.autoWA.sendText({
        to: this.msg.from,
        text: "Please put the text you want to put in QuickChat image.",
        answering: this.msg,
      });
    }
  }
}

module.exports = QuickChat;
