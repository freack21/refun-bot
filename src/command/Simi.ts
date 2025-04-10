import AutoWA, { AutoWAError, WAutoMessageComplete } from "whatsauto.js";
import Command from "./base";
import CommandHandler from "./handler";
import FundayBOT from "../FundayBOT";
import axios from "axios";

export default class Simi extends Command {
  aliases = ["simi"];
  name = "SimSimi";
  description = {
    id: "Ngobrol sama SimSimi",
    en: "Talk to SimSimi",
  };
  params = {
    text: {
      required: true,
      description: {
        en: "Text you want send to SimSimi",
        id: "Teks yang ingin kamu kirim ke SimSimi",
      },
      example: "hello",
      value: async () => await this.args.join("|"),
      default: "",
    },
  };

  constructor(
    autoWA: AutoWA,
    msg: WAutoMessageComplete,
    args: string[],
    commandHandler: CommandHandler,
    fundayBOT: FundayBOT
  ) {
    super(autoWA, msg, args, commandHandler, fundayBOT);
  }

  async execute() {
    try {
      const param_text = this.getParamValue("text");
      const lc = this.getConfig("lang");
      const res = await axios.post("https://api.simsimi.vn/v1/simtalk", {
        text: param_text,
        lc,
      });
      if (res.data.message)
        await this.msg.replyWithText(res.data.message.trim());
      else await this.msg.replyWithText(this.getSentence("simi_empty_msg"));
    } catch (err) {
      this.errorExplanation = this.getSentence("simi_server_err");
      await this.sendExecutionError();
    }
  }
}
