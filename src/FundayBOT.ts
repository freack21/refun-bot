import AutoWA from "whatsauto.js";
import CommandHandler from "./command/handler";
import { Language } from "./data/lang";
import * as fs from "fs";

export default class FundayBOT {
  private name: string;
  private isReading: boolean;
  private autoWA: AutoWA;
  private configPath = "./database/config.json";

  constructor() {
    this.name = "FundayBOT";
    this.isReading = false;

    this.autoWA = new AutoWA("FundayBOT", { printQR: true });
  }

  async startBot() {
    this.autoWA.event.onMessageReceived(async (msg) => {
      if (this.isReading) await msg.read();

      if (msg.isStory || msg.isReaction) return;

      const msgText = msg.text || "";
      const command = this.getCommand(msgText);
      const args = this.getArgs(msgText);

      const commandHandler = new CommandHandler(this.autoWA, msg, args, this);

      const handler = (await commandHandler.handlers()).filter((handler) =>
        handler.aliases.includes(command)
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
      .trim()
      .split(" ")
      .slice(1)
      .join(" ")
      .split("|")
      .map((x) => x.trim());
  }

  setLanguage(language: Language) {
    this.setConfigs("lang", language);
  }

  getLanguage(): Language {
    const data = this.getConfigs();

    if (!data["lang"]) {
      this.setLanguage("en");
      return this.getLanguage();
    }

    return data["lang"] as Language;
  }

  validateConfigs(): void {
    if (!fs.existsSync(this.configPath)) {
      const data = {};
      fs.writeFileSync(this.configPath, JSON.stringify(data, null, 2));
    }
  }

  getConfigs(): Record<string, string> {
    this.validateConfigs();

    const _config = fs.readFileSync(this.configPath, { encoding: "utf-8" });
    const data = JSON.parse(_config) as Record<string, Language>;

    return data;
  }

  setConfigs(key: string, value: string): void {
    this.validateConfigs();

    const _config = fs.readFileSync(this.configPath, { encoding: "utf-8" });
    const data = JSON.parse(_config) as Record<string, string>;

    data[key] = value;

    fs.writeFileSync(this.configPath, JSON.stringify(data, null, 2));
  }

  getName() {
    return this.name;
  }
}
