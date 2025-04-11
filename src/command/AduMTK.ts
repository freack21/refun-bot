import AutoWA, { WAutoMessageComplete } from "whatsauto.js";
import Command from "./base";
import CommandHandler from "./handler";
import FundayBOT from "../FundayBOT";
import { _groups_ } from "../data/lang";

export default class CommandChild extends Command {
  aliases = ["adumtk", "mathbattle"];
  name = {
    en: "Math Battle",
    id: "Adu MTK",
  };
  description = {
    id: "Main game adu MTK",
    en: "Play math battle game",
  };
  group = _groups_["games"];
  params = {
    level: {
      required: false,
      description: {
        en: "The level of difficulty of the questions",
        id: "Tingkat kesulitan pertanyaan",
      },
      value: async () => this.args[0],
      default: 1,
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
    if (await this.isAlreadyStarted()) return;

    const param_level = await this.getParamValue("level");

    let operators = this.getRandomInt(1, 2);
    if (param_level == 2) operators = this.getRandomInt(2, 4);
    else if (param_level == 3) operators = this.getRandomInt(5, 6);
    let operand = this.getRandomInt(1, 5);
    let soal = operand.toString();
    let reward = 0;

    const _ops: Record<number, string> = {
      1: " + ",
      2: " - ",
      3: " * ",
      4: " / ",
    };
    for (let i = 0; i < operators; i++) {
      const operat = this.getRandomInt(1, 4);
      soal += _ops[operat];
      reward += operat;
      let sum: number;
      do {
        operand = this.getRandomInt(1, 5);
        sum = eval(soal + operand);
      } while (!Number.isInteger(sum));
      soal += operand;
    }

    let answer = eval(soal).toString();
    soal = soal.replace(/\*/g, "x");
    reward = reward * 4 + reward;
    if (reward < 25) reward = 25;
    const duration = 30;

    let text = this.getSentence("adumtk_result", {
      reward,
      duration,
      quest: soal,
    });

    const questMsg = await this.msg.replyWithText(text);

    this.setUnAnsweredMsg(questMsg, [answer], reward, 30);
  }
}
