import AutoWA, { IWAutoMessage, phoneToJid } from "whatsauto.js";
import CommandHandler from "./command/handler";
import fs from "fs";
import { join } from "path";
import {
  _limitlist_,
  ConfigShema,
  ConfigValue,
  UserConfigShema,
  UserPoint,
} from "./types";
import Matcher from "./data/matcher";
import getSentence, {
  Language,
  Replacements,
  Sentences,
  setSentences,
} from "./data/lang";
import { randomUUID } from "crypto";
import { DB } from "./data/firebase";

export default class FundayBOT {
  private name: string = "FundayBOT";
  public autoWA: AutoWA;

  public defaultBotConfig: ConfigShema = {
    reading: false,
    admin: [],
  };
  private _botConfig_: ConfigShema = {};
  private _userConfig_: UserConfigShema = {};

  public defaultUserConfig: ConfigShema = {
    lang: "en",
    tier: 0,
    duration: () => Date.now() + 999 * 24 * 60 * 60 * 1000,
    limit: (user) => {
      const tier = this.getUserConfig(user!, "tier") as number;
      return _limitlist_[tier];
    },
    limit_last_used: () =>
      new Date(Date.now() + 7 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0]
        .split("-")
        .pop()!,
    nick: () => "user#" + randomUUID().slice(0, 5),
    individual_point: {},
    group_point: {},
  };

  public matcher: Matcher;

  constructor() {
    this.autoWA = new AutoWA("FundayBOT", { printQR: true });

    this.matcher = new Matcher(this);
  }

  async startBot() {
    await setSentences();
    await this.setConfigs();
    await this.setUserConfigs();

    this.autoWA.on("connected", async () => {
      await this.receivedMessageHandler({
        quotedMessage: null,
        hasMedia: false,
        mediaType: "",
        isGroup: false,
        isStory: false,
        isReaction: false,
        text: "helloworld",
        author: this.getJid(),
        from: this.getJid(),
        read: async () => {},
        react: async () => {},
      } as unknown as IWAutoMessage);
    });

    this.autoWA.on(
      "private-message-received",
      this.receivedMessageHandler.bind(this)
    );

    this.autoWA.on(
      "group-message-received",
      this.receivedMessageHandler.bind(this)
    );

    await this.autoWA.initialize();
  }

  async receivedMessageHandler(msg: IWAutoMessage) {
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
      if (await handler.validate()) await handler.run();
      await msg.react("");
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

  async setConfigs(): Promise<ConfigShema> {
    try {
      const snapshot = await DB.collection("botConfig").doc("config").get();
      const data = snapshot.data() ?? {};

      this._botConfig_ = data as ConfigShema;
      return this._botConfig_;
    } catch (error) {
      return {};
    }
  }

  getConfigs(): ConfigShema {
    return this._botConfig_;
  }

  async setConfig(key: string, value: ConfigValue): Promise<void> {
    const data: ConfigShema = {};
    data[key] = value;

    await DB.collection("botConfig").doc("config").update(data);
    await this.setConfigs();
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
      return value;
    }

    return data[key];
  }

  async setUserConfigs(): Promise<UserConfigShema> {
    try {
      const snapshot = await DB.collection("userConfig").get();
      const docs = snapshot.docs;

      const result: Partial<UserConfigShema> = {};

      await Promise.all(
        docs.map(async (doc) => {
          const user = doc.id;
          const data = doc.data();
          result[user] = data ?? {};
        })
      );

      this._userConfig_ = result as UserConfigShema;
      return this._userConfig_;
    } catch (error) {
      return {};
    }
  }

  getUserConfigs(): UserConfigShema {
    return this._userConfig_;
  }

  async setUserConfig(
    user: string,
    key: string,
    value: ConfigValue
  ): Promise<void> {
    user = phoneToJid({
      from: user,
    });
    const data: ConfigShema = {};
    data[key] = value;

    await DB.collection("userConfig").doc(user).update(data);
    await this.setUserConfigs();
  }

  getUserConfig(user: string, key: string): ConfigValue {
    const data = this.getUserConfigs();

    if (!(user in data) || !(key in data[user])) {
      const value =
        key in this.defaultUserConfig
          ? typeof this.defaultUserConfig[key] == "function"
            ? this.defaultUserConfig[key](user)
            : this.defaultUserConfig[key]
          : "";
      return value;
    }

    return data[user][key];
  }

  getName() {
    return this.name;
  }

  async getSentence(
    user: string,
    langKey: string,
    replacements?: Replacements
  ): Promise<string> {
    const idLang = this.getUserConfig(user, "lang") as Language;
    const sentence = await getSentence(idLang, langKey);

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

  updateUserPoint(from: string, user: string, point: number) {
    const type = from.includes("@g.us") ? "group" : "individual";
    const configKey = type + "_point";

    const data = this.getUserConfig(user, configKey) as UserPoint;

    if (!data[from]) data[from] = 0;
    data[from] += point;

    this.setUserConfig(user, configKey, data);
  }

  getJid() {
    return phoneToJid({
      from: this.autoWA.sock.user?.id!,
    });
  }
}
