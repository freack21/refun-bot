import AutoWA, { IWAutoMessageReceived } from "whatsauto.js";
import { ConfigValue, ParamSchema } from "../../types";
import CommandHandler from "../handler/CommandHandler";
import lang, {
  CommandGroupEn,
  CommandGroupId,
  Language,
  Replacements,
} from "../../data/lang";
import FundayBOT from "../../FundayBOT";

export default class Command {
  public name: string = "this";
  public params: Record<string, ParamSchema> = {};
  public description: Record<Language, string> = {
    id: "",
    en: "",
  };
  public aliases: string[] = [""];
  public hide: boolean = false;
  public premium: boolean = false;
  public group: Record<Language, CommandGroupEn | CommandGroupId> = {
    en: "Basic",
    id: "Dasar",
  };
  public errorExplanation: string = "";
  public expectedArgs: string = "";

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
    const sentence =
      lang[this.fundayBOT.getConfig("lang") as Language][langKey] || langKey;

    if (!replacements) return sentence;

    return sentence.replace(/{(\w+)}/g, (_, key) => {
      return typeof replacements[key] !== "undefined"
        ? String(replacements[key])
        : `{${key}}`;
    });
  }

  async execute() {
    throw new Error("execute is not implemented");
  }

  async validate() {
    for (const key in this.params) {
      if (!(await this.getParamValue(key))) {
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
      name: this.name,
    });
    this.errorExplanation &&
      (text += `\n\n*${this.getSentence("explanation")}:*\n${
        this.errorExplanation
      }`);
    with_args_error &&
      (text += `\n\n*${this.getSentence("valid_arg")}:*\n${this.expectedArgs}`);

    return text;
  }

  getValidationMessage() {
    const parameters = [];
    for (const key in this.params) {
      const param = `${
        this.params[key].required ? "✅" : "❓"
      } | \`${key}\` : ${
        this.params[key].description[this.getConfig("lang") as Language]
      }${
        this.params[key].example
          ? ` — _example: *${this.params[key].example}*_`
          : ""
      }`;
      parameters.push(param);
    }
    let validationMsg = this.getSentence("validation", {
      name: this.name,
    });
    if (parameters.length) {
      validationMsg +=
        "\n\n" +
        this.getSentence("arguments", {
          args: parameters.join("\n"),
        });
    }
    if (this.aliases.length) {
      validationMsg +=
        "\n\n" +
        this.getSentence("aliases", {
          alias: this.aliases.map((d) => "`" + d + "`").join(", "),
        });
    }
    validationMsg += "\n\n" + this.getSentence("notes");

    return validationMsg;
  }

  async sendExecutionError(with_args_error: boolean = false) {
    await this.msg.replyWithText(this.getErrorMessage(with_args_error));
  }

  async sendValidationError() {
    await this.msg.replyWithText(this.getValidationMessage());
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
}
