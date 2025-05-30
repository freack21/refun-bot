import AutoWA, { AutoWAError, phoneToJid, IWAutoMessage } from "whatsauto.js";
import Command from "./base";
import CommandHandler from "./handler";
import FundayBOT from "../FundayBOT";
import { ParamSchema } from "../types";
import fs from "fs";
import { _groups_ } from "../data/lang";
import { join } from "path";

export default class CommandChild extends Command {
  aliases = ["tod", "truth", "dare"];
  name = {
    en: "Truth or Dare",
    id: "Truth or Dare",
  };
  public description: Record<"en" | "id", string> = {
    id: "Membuat tantangan atau pertanyaan kejujuran untuk teman secara acak / terpilih",
    en: "Make challenges or honest questions for friends randomly / selected",
  };
  public params: Record<string, ParamSchema> = {
    user: {
      required: false,
      default: null,
      value: async () => this.args[0],
      description: {
        id: "Tag user yang ingin dijadikan korban",
        en: "Tag user who wants to be a victim",
      },
    },
  };
  public mustBeGroup: boolean = true;
  group = _groups_["games"];
  public cost: number = 2;

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
    const param_user = await this.getParamValue("user");

    const cmd = this.getCommand() as "tod" | "truth" | "dare";
    const type = {
      tod: -1,
      truth: 0,
      dare: 1,
    }[cmd];
    try {
      const file = fs.readFileSync(join(__dirname, "../../database/tod.json"), {
        encoding: "utf-8",
      });
      let data = JSON.parse(file);
      let user: string | number | null = (param_user as string) || null;

      const grup = await this.autoWA.sock.groupMetadata(this.msg.from);

      if (!user) {
        do {
          user = this.pickRandom(grup.participants).id;
        } while (user == this.getBOTNumber());
      }
      user = phoneToJid({ from: user });

      if (await this.autoWA.isExist({ from: user })) {
        let mentions = [user];
        const mentionUser = phoneToJid({ from: user, reverse: true });
        const td = ["Truth", "Dare"];
        let text = "";
        if (type < 0) {
          const idx = this.getRandomInt(0, 1);
          const dot = td[idx].toLowerCase();
          const dataTod = data[dot];

          text = await this.getSentence("tod_result", {
            user: mentionUser,
            td: td[idx],
            quest: dataTod[this.getRandomInt(0, dataTod.length - 1)],
          });
        } else {
          const dataTod = data[cmd];
          text = await this.getSentence("tod_result", {
            user: mentionUser,
            td: td[type],
            quest: dataTod[this.getRandomInt(0, dataTod.length - 1)],
          });
        }
        await this.msg.replyWithText(text, { mentions });
      }
    } catch (err) {
      console.log(err);
      this.errorExplanation = (err as AutoWAError).message;
      await this.sendExecutionError();
    }
  }
}
