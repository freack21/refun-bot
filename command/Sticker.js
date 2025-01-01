const Command = require("./base");
const fs = require("fs");

class Sticker extends Command {
  aliases = ["s", "sticker"];

  constructor(autoWA, msg, args) {
    super(autoWA, msg, args);
  }

  async downloadMedia() {
    if (this.msg.hasMedia && this.msg.mediaType === "image") {
      return await this.msg.downloadMedia(
        `${Date.now() + Math.random() * 1000}`
      );
    }

    if (
      this.msg.quotedMessage &&
      this.msg.quotedMessage.mediaType === "image"
    ) {
      return await this.msg.quotedMessage.downloadMedia(
        `${Date.now() + Math.random() * 1000}`
      );
    }

    return null;
  }

  async execute() {
    const media = await this.downloadMedia();
    if (media) {
      const buffer = fs.readFileSync(media);

      await this.autoWA.sendSticker({
        to: this.msg.from,
        media: buffer,
      });

      fs.unlinkSync(media);
    } else {
      await this.autoWA.sendText({
        to: this.msg.from,
        text: "Please send an image or reply to an image.",
      });
    }
  }
}

module.exports = Sticker;
