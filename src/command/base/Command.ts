import AutoWA, { IWAutoMessageReceived } from "whatsauto.js";
import { ParamSchema } from "../../types";
import CommandHandler from "../handler/CommandHandler";

export default class Command {
  public name: string = "this";
  public messages: Record<string, string> = {
    error: "_Error_ while trying to execute *{name}* command.",
    validation:
      "Please put the _required_ argument(s) to execute *{name}* command."
  };
  public params: Record<string, ParamSchema> = {};
  public description: string = "";
  public aliases: string[] = [""];
  public hide: boolean = false;

  protected autoWA: AutoWA;
  protected msg: IWAutoMessageReceived;
  protected args: string[];
  protected commandHandler: CommandHandler;

  constructor(
    autoWA: AutoWA,
    msg: IWAutoMessageReceived,
    args: string[],
    commandHandler: CommandHandler
  ) {
    this.autoWA = autoWA;
    this.msg = msg;
    this.args = args;
    this.commandHandler = commandHandler;
  }

  async execute() {
    throw new Error("execute is not implemented");
  }

  getErrorMessage() {
    return this.messages.error.replace("{name}", this.name);
  }

  getValidationMessage() {
    const parameters = [];
    for (const key in this.params) {
      const param = `${this.params[key].required ? "✅" : "❓"} | *${key}* - ${
        this.params[key].description
      }${
        this.params[key].example ? `, _ex. ${this.params[key].example}_` : ""
      }`;
      parameters.push(param);
    }
    let validationMsg = this.messages.validation.replace("{name}", this.name);
    if (parameters.length) {
      validationMsg += `\n\n*Argument(s):*\n${parameters.join("\n")}`;
    }
    if (this.aliases.length) {
      validationMsg += `\n\n*Alias(es):*\n- ${this.aliases.join("\n- ")}`;
    }
    validationMsg += `\n\n*Note(s):*\n- ✅ means *required*\n- ❓ means *optional*`;

    return validationMsg;
  }

  async sendExecutionError() {
    await this.msg.replyWithText(this.getErrorMessage());
  }

  async sendValidationError() {
    await this.msg.replyWithText(this.getValidationMessage());
  }
}
