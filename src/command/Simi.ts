import AutoWA, { IWAutoMessage } from "whatsauto.js";
import Command from "./base";
import CommandHandler from "./handler";
import FundayBOT from "../FundayBOT";
import axios from "axios";
import querystring from "querystring";
import { _groups_ } from "../data/lang";

export default class CommandChild extends Command {
  aliases = ["simi"];
  name = {
    en: "SimSimi",
    id: "SimSimi",
  };
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
      value: async () => this.args.join("|"),
      default: "",
    },
  };
  group = _groups_["ai"];

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
    try {
      const param_text = await this.getParamValue("text");
      const lc = this.getLang();
      const res = await axios.post(
        "https://api.simsimi.vn/v1/simtalk",
        querystring.stringify({
          text: param_text as string,
          lc,
        })
      );
      if (res.data.message)
        await this.msg.replyWithText(res.data.message.trim());
      else await this.msg.replyWithText(this.getSentence("simi_empty_msg"));
    } catch (err) {
      this.errorExplanation = this.getSentence("simi_server_err");
      await this.sendExecutionError();
    }
  }
}
