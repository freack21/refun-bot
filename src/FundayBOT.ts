import AutoWA, { IWAutoMessageReceived } from "whatsauto.js";
import CommandHandler from "./command/handler";
import { Language } from "./data/lang";
import * as fs from "fs";
import { ConfigShema, ConfigValue } from "./types";

export default class FundayBOT {
  private name: string = "FundayBOT";
  private autoWA: AutoWA;
  private configPath = "./database/config.json";

  private defaultBotConfig: ConfigShema = {
    lang: "en",
    reading: false,
  };

  constructor() {
    this.autoWA = new AutoWA("FundayBOT", { printQR: true });
  }

  async startBot() {
    this.autoWA.event.onPrivateMessageReceived(
      this.receivedMessageHandler.bind(this)
    );
    this.autoWA.event.onGroupMessageReceived(
      this.receivedMessageHandler.bind(this)
    );

    await this.autoWA.initialize();
  }

  async receivedMessageHandler(msg: IWAutoMessageReceived) {
    if (this.getConfig("reading") as boolean) await msg.read();

    const msgText = msg.text || "";
    const command = this.getCommand(msgText);
    const args = this.getArgs(msgText);

    const commandHandler = new CommandHandler(this.autoWA, msg, args, this);

    const handler = (await commandHandler.handlers()).filter((handler) =>
      handler.aliases.includes(command)
    )[0];
    if (handler) {
      await msg.react("⌛");
      if (await handler.validate()) await handler.execute();
      await msg.react("");
    }
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

  validateConfigs(): void {
    if (!fs.existsSync(this.configPath)) {
      const data = {};
      fs.writeFileSync(this.configPath, JSON.stringify(data, null, 2));
    }
  }

  getConfigs(): ConfigShema {
    this.validateConfigs();

    const _config = fs.readFileSync(this.configPath, { encoding: "utf-8" });
    const data = JSON.parse(_config) as ConfigShema;

    return data;
  }

  setConfig(key: string, value: ConfigValue): void {
    this.validateConfigs();

    const _config = fs.readFileSync(this.configPath, { encoding: "utf-8" });
    const data = JSON.parse(_config) as ConfigShema;

    data[key] = value;

    fs.writeFileSync(this.configPath, JSON.stringify(data, null, 2));
  }

  getConfig(key: string): ConfigValue {
    const data = this.getConfigs();

    if (!(key in data)) {
      this.setConfig(key, this.defaultBotConfig[key]);
      return this.getConfig(key);
    }

    return data[key];
  }

  getName() {
    return this.name;
  }
}
