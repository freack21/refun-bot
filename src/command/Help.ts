import AutoWA, { IWAutoMessage } from "whatsauto.js";
import Command from "./base";
import CommandHandler from "./handler";
import FundayBOT from "../FundayBOT";
import { ParamSchema } from "../types";

export default class CommandChild extends Command {
  aliases = ["help"];
  name = {
    en: "Help",
    id: "Bantuan",
  };
  public description: Record<"en" | "id", string> = {
    id: "Melihat fungsi dan cara penggunaan perintah",
    en: "View the function and how to use command",
  };
  public params: Record<string, ParamSchema> = {
    command: {
      required: true,
      default: null,
      description: {
        id: "Perintah yang ingin dilihat",
        en: "The command you want to see",
      },
      value: async () => this.args[0],
      example: "sticker",
    },
  };

  constructor(
    autoWA: AutoWA,
    msg: IWAutoMessage,
    args: string[],
    commandHandler: CommandHandler,
    fundayBOT: FundayBOT
  ) {
    super(autoWA, msg, args, commandHandler, fundayBOT);
  }

  async execute() {
    const handlers = await this.commandHandler.handlers();

    const param_command = (await this.getParamValue("command")) as string;

    const cmd = handlers.filter((handler) =>
      handler.aliases.includes(param_command)
    )[0];
    if (!cmd) {
      this.errorExplanation = await this.getSentence("cmd_not_found", {
        cmd: param_command,
      });
      await this.sendExecutionError();
      return;
    }

    let text = `*${cmd.getName()}*${
      cmd.getDescription() ? " | " : " "
    }${cmd.getDescription()}${cmd.getExampleMessage()}${cmd.getArgsMessage()}${cmd.getAliasesMessage()}`;

    await this.msg.replyWithText(text);
  }
}
