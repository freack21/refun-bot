import AutoWA, {
  IWAutoMessage,
  IWAutoMessageReceived,
  phoneToJid,
} from "whatsauto.js";
import {
  _limitlist_,
  _tierlist_,
  ConfigValue,
  ParamSchema,
  UserTierData,
} from "../../types";
import CommandHandler from "../handler/CommandHandler";
import { _groups_, Language, Replacements, Sentence } from "../../data/lang";
import FundayBOT from "../../FundayBOT";
import { proto } from "@whiskeysockets/baileys";

export default class Command {
  public name: Sentence = {
    en: "this",
    id: "ini",
  };
  public params: Record<string, ParamSchema> = {};
  public description: Sentence = {
    id: "",
    en: "",
  };
  public aliases: string[] = [""];
  public hide: boolean = false;
  public tier: number = 0;
  public group: Sentence = _groups_["basic"];
  public errorExplanation: string = "";
  public expectedArgs: string = "";
  public mustBeGroup: boolean = false;
  public mustBePrivate: boolean = false;
  public adminOnly: boolean = false;
  public cost: number = 0;

  protected autoWA: AutoWA;
  protected msg: IWAutoMessageReceived;
  protected args: string[];
  protected commandHandler: CommandHandler;

  private fundayBOT: FundayBOT;

  constructor(
    autoWA: AutoWA,
    msg: IWAutoMessageReceived,
    args: string[],
    commandHandler: CommandHandler,
    fundayBOT: FundayBOT
  ) {
    this.autoWA = autoWA;
    this.msg = msg;
    this.args = args;
    this.commandHandler = commandHandler;

    this.fundayBOT = fundayBOT;
  }

  getSentence(langKey: string, replacements?: Replacements): string {
    return this.fundayBOT.getSentence(this.msg.author, langKey, replacements);
  }

  async execute() {
    throw new Error("execute is not implemented");
  }

  async run() {
    await this.execute();

    if (this.cost) {
      this.updateUserLimit(-this.cost);
    }
  }

  async validate() {
    if (this.adminOnly && !this.isAdmin()) {
      await this.sendMustBeAdmin();
      return false;
    }

    if (this.mustBeGroup && !this.msg.isGroup) {
      await this.sendMustBeGroup();
      return false;
    }

    if (this.mustBePrivate && this.msg.isGroup) {
      await this.sendMustBePrivate();
      return false;
    }

    if (this.tier > this.getUserTier()) {
      await this.sendMustBePremium();
      return false;
    }

    if (this.cost && this.getUserLimit() - this.cost < 0) {
      await this.sendNotEnoughLimit();
      return false;
    }

    for (const key in this.params) {
      const param = await this.getParamValue(key);
      if (
        ((!this.params[key].typedata ||
          this.params[key].typedata == "single") &&
          !param &&
          param !== null) ||
        (this.params[key].typedata == "array" && !(param as []).length)
      ) {
        if (this.params[key].required) {
          await this.sendValidationError();
          return false;
        } else {
          this.params[key].value = async () => this.params[key].default;
        }
      }

      if (this.params[key]?.validate) {
        if (!(await this.params[key].validate())) {
          await this.sendExecutionError(true);
          return false;
        }
      }
    }
    return true;
  }

  getErrorMessage(with_args_error: boolean = false) {
    let text = this.getSentence("error_command", {
      name: this.getName(),
    });
    if (with_args_error)
      this.errorExplanation = this.getSentence("args_not_valid");

    this.errorExplanation &&
      (text += `\n\n*${this.getSentence("explanation")}:*\n${
        this.errorExplanation
      }`);
    with_args_error &&
      (text += `\n\n*${this.getSentence("valid_arg")}:*\n${this.expectedArgs}`);

    return text;
  }

  getValidationMessage() {
    let validationMsg = this.getSentence("validation", {
      name: this.getName(),
    });
    validationMsg += this.getExampleMessage();
    validationMsg += this.getArgsMessage();
    validationMsg += this.getAliasesMessage();

    return validationMsg;
  }

  getArgsMessage(cmd?: Command) {
    const my_cmd = cmd || this;
    const parameters = [];
    for (const key in my_cmd.params) {
      const param = `${
        my_cmd.params[key].required ? "✅" : "❓"
      } | \`${key}\` : ${my_cmd.params[key].description[this.getLang()]}${
        my_cmd.params[key].example
          ? ` — _example: *${my_cmd.params[key].example}*_`
          : ""
      }`;
      parameters.push(param);
    }
    if (parameters.length) {
      return (
        "\n\n" +
        this.getSentence("arguments", {
          args: parameters.join("\n"),
        })
      );
    }

    return "";
  }

  getExampleMessage(cmd?: Command) {
    const my_cmd = cmd || this;
    let text = "/" + this.aliases[0];
    let textArgs = [];
    let exampleArgs = [];
    let attachments = [];
    for (const [param, schema] of Object.entries(my_cmd.params)) {
      if (!schema.type) {
        textArgs.push(`${param}${schema.required ? "" : "?"}`);
        exampleArgs.push(schema.example || "");
      } else
        attachments.push(
          this.getSentence("attachment_pls", {
            type: String(schema.type[this.getLang()]),
            req: schema.required ? "" : "?",
          })
        );
    }
    if (textArgs.length) {
      text = `\`${text} ${textArgs.join("|")}\``;
      text = `${text}\n👉 \`${"/" + this.aliases[0]} ${exampleArgs.join(
        "|"
      )}\``;
    }
    if (attachments.length) {
      text = `*[ ${attachments.join(" | ")} ]*\n${text}`;
    }
    text =
      "\n\n" +
      this.getSentence("examples", {
        text,
      });

    return text;
  }

  getAliasesMessage(cmd?: Command, withNotes: boolean = true) {
    const my_cmd = cmd || this;

    let text = "";
    if (my_cmd.aliases.length) {
      text +=
        "\n\n" +
        this.getSentence("aliases", {
          alias: my_cmd.aliases.map((d) => "`" + d + "`").join(", "),
        });
    }

    if (withNotes) {
      text += "\n\n" + this.getSentence("notes");
    }

    return text;
  }

  async sendExecutionError(with_args_error: boolean = false) {
    await this.msg.replyWithText(this.getErrorMessage(with_args_error));
  }

  async sendValidationError() {
    await this.msg.replyWithText(this.getValidationMessage());
  }

  async sendMustBeGroup() {
    await this.msg.replyWithText(
      this.getSentence("must_be_group", {
        cmd: this.getName(),
      })
    );
  }

  async sendMustBePrivate() {
    await this.msg.replyWithText(
      this.getSentence("must_be_private", {
        cmd: this.getName(),
      })
    );
  }

  async sendMustBePremium() {
    await this.msg.replyWithText(
      this.getSentence("must_be_premium", {
        cmd: this.getName(),
        tier: _tierlist_[this.tier],
      })
    );
  }

  async sendMustBeAdmin() {
    await this.msg.replyWithText(
      this.getSentence("must_be_admin", {
        cmd: this.getName(),
      })
    );
  }

  async sendNotEnoughLimit() {
    await this.msg.replyWithText(
      this.getSentence("not_enough_limit", {
        cmd: this.getName(),
        cost: this.cost,
      })
    );
  }

  async sendAlreadyStartedMessage(quoting_msg: IWAutoMessage) {
    const lang = this.getLang();
    await this.autoWA.sendText({
      to: this.msg.key.remoteJid!,
      text: this.getSentence("already_started", {
        topic: this.getName(),
      }),
      answering: quoting_msg,
    });
  }

  async isAlreadyStarted() {
    const expectAnswers = this.getBOT().matcher.getUnAnsweredMsg(
      this.msg.from,
      this.name["en"]
    );
    if (expectAnswers) {
      const msg = expectAnswers.msg as IWAutoMessage;
      msg && (await this.sendAlreadyStartedMessage(msg));
      return true;
    }

    return false;
  }

  getBOT() {
    return this.fundayBOT;
  }

  async getParamValue(key: string) {
    return await this.params[key].value();
  }

  getConfig(key: string) {
    return this.fundayBOT.getConfig(key);
  }

  setConfig(key: string, value: ConfigValue) {
    return this.fundayBOT.setConfig(key, value);
  }

  getUserConfig(key: string) {
    return this.fundayBOT.getUserConfig(this.msg.author, key);
  }

  setUserConfig(key: string, value: ConfigValue) {
    return this.fundayBOT.setUserConfig(this.msg.author, key, value);
  }

  pickRandom<T>(arr: T[]): T {
    if (arr.length === 0) return arr[0];
    return arr[Math.floor(Math.random() * arr.length)];
  }

  getRandomInt(min: number, max: number): number {
    const minCeil = Math.ceil(min);
    const maxFloor = Math.floor(max);
    return Math.floor(Math.random() * (maxFloor - minCeil + 1)) + minCeil;
  }

  getMatcher() {
    return this.fundayBOT.matcher;
  }

  getCommand() {
    return this.getBOT().getCommand(this.msg.text);
  }

  getBOTNumber() {
    return phoneToJid({
      from: this.fundayBOT.autoWA.sock.user?.id!,
    });
  }

  getLang() {
    return this.fundayBOT.getUserConfig(this.msg.author, "lang") as Language;
  }

  getName() {
    return this.name[this.getLang()];
  }

  getDescription() {
    return this.description[this.getLang()];
  }

  setUnAnsweredMsg(
    msg: proto.IWebMessageInfo,
    answers: string[],
    reward: number,
    duration: number
  ) {
    this.getMatcher().setUnAnsweredMsg(this.msg.from, this.name["en"], {
      msg,
      answers,
      reward,
      duration,
      right_msg: this.getSentence("answer_right", {
        topic: this.getName(),
        reward,
      }),
      wrong_msg: this.getSentence("answer_wrong", {
        topic: this.getName(),
      }),
      a_05_msg: this.getSentence("answer_05", {
        topic: this.getName(),
      }),
      a_07_msg: this.getSentence("answer_07", {
        topic: this.getName(),
      }),
      timeout_msg: this.getSentence("answer_timeout", {
        topic: this.getName(),
      }),
      createdAt: Date.now(),
    });
  }

  getTxt(langKey: string, replacements?: Replacements) {
    return this.fundayBOT.getTxt(this.msg.author, langKey, replacements);
  }

  updateUserPoint(point: number) {
    return this.fundayBOT.updateUserPoint(
      this.msg.from,
      this.msg.author,
      point
    );
  }

  isAdmin() {
    return (
      (this.getConfig("admin") as string[]).filter(
        (d) => phoneToJid({ from: d }) == this.msg.author
      ).length > 0
    );
  }

  getUserTierData(): UserTierData {
    const tier = this.getUserConfig("tier") as number;
    const duration = this.getUserConfig("duration") as number;
    const limit = this.getUserConfig("limit") as number;

    if (Date.now() > duration) {
      this.setUserConfig("tier", 0);
      this.setUserConfig("limit", _limitlist_[0]);
      this.setUserConfig(
        "duration",
        (this.fundayBOT.defaultUserConfig["duration"] as Function)()
      );

      return this.getUserTierData();
    }

    return {
      duration,
      tier,
      user: this.msg.author,
      limit,
    };
  }

  getUserTier(): number {
    return this.getUserTierData().tier as number;
  }

  getUserLimit(): number {
    const limit = this.getUserTierData().limit;
    const limit_last_used = this.getUserConfig("limit_last_used") as string;
    const now = new Date(Date.now() + 7 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0]
      .split("-")
      .pop()!;

    if (limit_last_used != now) {
      const new_limit = _limitlist_[this.getUserTier()];
      this.setUserConfig("limit", new_limit);
      this.setUserConfig("limit_last_used", now);
      return new_limit;
    }

    return limit as number;
  }

  updateUserLimit(much: number = 0) {
    let limit = this.getUserLimit();
    limit += much;
    this.setUserConfig("limit", limit);
    return limit;
  }
}
