import AutoWA, { IWAutoMessage } from "whatsauto.js";
import Command from "./base";
import CommandHandler from "./handler";
import FundayBOT from "../FundayBOT";

export default class CommandChild extends Command {
  aliases = ["setnick", "snick"];
  name = {
    en: "Set Nickname",
    id: "Ubah Nickname",
  };
  description = {
    id: "Ubah nickname kamu",
    en: "Set your nickname",
  };
  params = {
    nick: {
      required: true,
      description: {
        en: "Your nickname (without space)",
        id: "Nickname kamu (tanpa spasi)",
      },
      example: "swagger",
      value: async () => {
        return this.args[0];
      },
      validate: async () => {
        return !((await this.getParamValue("nick")) as string).includes(" ");
      },
      default: null,
    },
  };
  public tier: number = 1;
  expectedArgs = this.params.nick.description[this.getLang()];
  public cost: number = 5;

  constructor(
    autoWA: AutoWA,
    msg: IWAutoMessage,
    args: string[],
    commandHandler: CommandHandler,
    fundayBOT: FundayBOT
  ) {
    super(autoWA, msg, args, commandHandler, fundayBOT);
  }

  async execute(): Promise<void> {
    const param_nick = await this.getParamValue("nick");

    await this.setUserConfig("nick", param_nick as string);

    await this.msg.replyWithText(await this.getSentence("cnick_success"));
  }
}
