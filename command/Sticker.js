const Command = require("./base");

class Sticker extends Command {
  aliases = ["s", "sticker"];

  constructor(autoWA, msg, args) {
    super(autoWA, msg, args);
  }

  async downloadMedia() {
    if (this.msg.hasMedia && ["image", "video"].includes(this.msg.mediaType)) {
      return await this.msg.downloadMedia(
        `${Date.now() + Math.random() * 1000}`
      );
    }

    if (
      this.msg.quotedMessage &&
      ["image", "video"].includes(this.msg.quotedMessage.mediaType)
    ) {
      return await this.msg.quotedMessage.downloadMedia(
        `${Date.now() + Math.random() * 1000}`
      );
    }

    return null;
  }

  async execute() {
    const filePath = await this.downloadMedia();
    if (filePath) {
      await this.autoWA.sendSticker({
        to: this.msg.from,
        filePath,
        answering: this.msg,
      });
    } else {
      await this.autoWA.sendText({
        to: this.msg.from,
        text: "Please send an media or reply to an media.",
        answering: this.msg,
      });
    }
  }
}

module.exports = Sticker;
