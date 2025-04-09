import AutoWA, { IWAutoMessageReceived } from "whatsauto.js";
import { ParamSchema } from "../../types";
import CommandHandler from "../handler/CommandHandler";
import lang, { Language } from "../../data/lang";
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
  public group: string = "General";
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

  getSentence(langKey: string) {
    return lang[this.fundayBOT.getLanguage()][langKey] || langKey;
  }

  async execute() {
    throw new Error("execute is not implemented");
  }

  getErrorMessage(with_args_error: boolean = false) {
    let text = this.getSentence("error_command").replace("{name}", this.name);
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
      } | \`${key}\` : ${this.params[key].description}${
        this.params[key].example
          ? ` — _example: *${this.params[key].example}*_`
          : ""
      }`;
      parameters.push(param);
    }
    let validationMsg = this.getSentence("validation").replace(
      "{name}",
      this.name
    );
    if (parameters.length) {
      validationMsg +=
        "\n\n" +
        this.getSentence("arguments").replace("{args}", parameters.join("\n"));
    }
    if (this.aliases.length) {
      validationMsg +=
        "\n\n" +
        this.getSentence("aliases").replace(
          "{alias}",
          this.aliases.map((d) => "`" + d + "`").join(", ")
        );
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
}
