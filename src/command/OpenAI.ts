import AutoWA, { IWAutoMessage } from "whatsauto.js";
import Command from "./base";
import CommandHandler from "./handler";
import FundayBOT from "../FundayBOT";
import OpenAI from "openai";
import { _groups_, Sentence } from "../data/lang";

export default class CommandChild extends Command {
  public hide: boolean = true;
  aliases = ["gpt", "openai", "chatgpt"];
  name = {
    en: "ChatGPT",
    id: "ChatGPT",
  };
  description = {
    id: "Kirim pesan ke ChatGPT",
    en: "Send a message to ChatGPT",
  };
  params = {
    text: {
      required: true,
      default: null,
      value: async () => this.msg.quotedMessage?.text || this.args.join("|"),
      description: {
        id: "Teks yang akan dikirim",
        en: "The text to be sent",
      },
      example: "Hello!",
    },
  };
  public group: Sentence = _groups_["ai"];
  public cost: number = 1;

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
    const param_text = await this.getParamValue("text");

    const client = new OpenAI({
      apiKey: this.getConfig("openai") as string,
    });

    const response = await client.responses.create({
      model: "gpt-4o-mini",
      instructions: "You are a coding assistant that talks like a pirate",
      input: param_text as string,
    });

    await this.msg.replyWithText(response.output_text);
  }
}
