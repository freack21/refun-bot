const Command = require("./base");

class Sticker extends Command {
  aliases = ["s", "sticker"];
  name = "Sticker";
  description = "Make a sticker from an image or video.";
  params = {
    media: {
      required: true,
      description: "The image or video you want to make a sticker",
      example: "send or reply to an image or video.",
      value: null,
    },
  };

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
    if (!filePath) {
      return await this.sendValidationError();
    }
    await this.autoWA.sendSticker({
      to: this.msg.from,
      filePath,
      answering: this.msg,
      pack: "@fkrvndii",
      author: "Fikri Rivandi",
    });
  }
}

module.exports = Sticker;
