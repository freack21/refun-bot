import AutoWA, { IWAutoMessageReceived } from "whatsauto.js";
import CommandHandler from "./command/handler";
import fs from "fs";
import { ConfigShema, ConfigValue, UserConfigShema } from "./types";
import Matcher from "./data/matcher";
import getSentences, { Language, Replacements } from "./data/lang";

export default class FundayBOT {
  private name: string = "FundayBOT";
  public autoWA: AutoWA;
  private configPath = "./database/config.json";
  private userConfigPath = "./database/userConfig.json";

  private defaultBotConfig: ConfigShema = {
    reading: false,
  };

  private defaultUserConfig: ConfigShema = {
    lang: "en",
    tier: 0,
    limit: 10,
    nick: () => "user#" + (this.getUserCount() + 1),
  };

  public matcher: Matcher;

  constructor() {
    this.autoWA = new AutoWA("FundayBOT", { printQR: true });

    this.matcher = new Matcher(this);
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
    } else {
      await this.matcher.checkAnsweringMsg(msg);
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

  validateConfigs(path: string): void {
    if (!fs.existsSync(path)) {
      const data = {};
      fs.writeFileSync(path, JSON.stringify(data, null, 2));
    }
  }

  getConfigs(): ConfigShema {
    this.validateConfigs(this.configPath);

    try {
      const _config = fs.readFileSync(this.configPath, { encoding: "utf-8" });
      const data = JSON.parse(_config) as ConfigShema;

      return data;
    } catch (error) {
      return {};
    }
  }

  setConfig(key: string, value: ConfigValue): void {
    const data = this.getConfigs();

    data[key] = value;

    fs.writeFileSync(this.configPath, JSON.stringify(data, null, 2));
  }

  getConfig(key: string): ConfigValue {
    const data = this.getConfigs();

    if (!(key in data)) {
      const value =
        key in this.defaultBotConfig
          ? typeof this.defaultBotConfig[key] == "function"
            ? this.defaultBotConfig[key]()
            : this.defaultBotConfig[key]
          : "";
      this.setConfig(key, value);
      return this.getConfig(key);
    }

    return data[key];
  }

  getUserConfigs(): UserConfigShema {
    this.validateConfigs(this.userConfigPath);

    try {
      const _config = fs.readFileSync(this.userConfigPath, {
        encoding: "utf-8",
      });
      const data = JSON.parse(_config) as UserConfigShema;

      return data;
    } catch (error) {
      return {};
    }
  }

  setUserConfig(user: string, key: string, value: ConfigValue): void {
    const data = this.getUserConfigs();

    if (!data[user]) data[user] = {};

    data[user][key] = value;

    fs.writeFileSync(this.userConfigPath, JSON.stringify(data, null, 2));
  }

  getUserConfig(user: string, key: string): ConfigValue {
    const data = this.getUserConfigs();

    if (!(user in data) || !(key in data[user])) {
      const value =
        key in this.defaultUserConfig
          ? typeof this.defaultUserConfig[key] == "function"
            ? this.defaultUserConfig[key]()
            : this.defaultUserConfig[key]
          : "";
      this.setUserConfig(user, key, value);
      return this.getUserConfig(user, key);
    }

    return data[user][key];
  }

  getName() {
    return this.name;
  }

  getSentence(
    user: string,
    langKey: string,
    replacements?: Replacements
  ): string {
    const idLang = this.getUserConfig(user, "lang") as Language;
    const sentence = getSentences()[idLang][langKey] || langKey;

    if (!replacements) return sentence;

    return sentence.replace(/{(\w+)}/g, (_, key) => {
      return typeof replacements[key] !== "undefined"
        ? String(replacements[key])
        : `{${key}}`;
    });
  }

  getUserCount() {
    return Object.keys(this.getUserConfigs()).length;
  }
}
