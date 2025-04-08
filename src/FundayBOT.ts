import AutoWA from "whatsauto.js";
import CommandHandler from "./command/handler";

export default class FundayBOT {
  private name: string;
  private isReading: boolean;
  private autoWA: AutoWA;

  constructor() {
    this.name = "FundayBOT";
    this.isReading = false;

    this.autoWA = new AutoWA("FundayBOT", { printQR: true });
  }

  async startBot() {
    this.autoWA.event.onMessageReceived(async (msg) => {
      if (msg.isStory || msg.isReaction) return;

      const msgText = msg.text || "";
      const command = this.getCommand(msgText);
      const args = this.getArgs(msgText);

      const commandHandler = new CommandHandler(this.autoWA, msg, args);

      const handler = (await commandHandler.handlers()).filter(
        (handler) => handler.aliases.includes(command) && !handler.hide
      )[0];
      if (handler) {
        await msg.react("⌛");
        await handler.execute();
        await msg.react("");
      }
    });
    await this.autoWA.initialize();
  }

  getCommand(text = "") {
    text = text.toLowerCase();
    return text.replace(/^[^a-zA-Z]+/, "").split(" ")[0];
  }

  getArgs(text = "") {
    return text
      .split(" ")
      .slice(1)
      .join(" ")
      .split("|")
      .map((x) => x.trim());
  }
}
