import AutoWA, { phoneToJid, IWAutoMessage } from "whatsauto.js";
import Command from "./base";
import CommandHandler from "./handler";
import FundayBOT from "../FundayBOT";
import { _groups_, Sentence } from "../data/lang";
import { _limitlist_, _tierlist_, ParamSchema, UserTierData } from "../types";

export default class CommandChild extends Command {
  aliases = ["upgradeplan", "uplan", "uptier"];
  name = {
    id: "Tingkatkan Tier",
    en: "Upgrade Tier",
  };
  description = {
    en: "Upgrade tier for certain users",
    id: "Tingkatkan tier untuk user tertentu",
  };
  public adminOnly: boolean = true;
  public group: Sentence = _groups_["admin"];
  public params: Record<string, ParamSchema> = {
    data: {
      required: true,
      description: {
        id: "Tag user yang ingin ditingkatkan tier-nya",
        en: "Tag user you want to upgrade the tier",
      },
      default: null,
      example: "62812345678:1:30",
      typedata: "array",
      value: async () => {
        if (!this.args[0]) return [];
        return this.args.map((d) => {
          const [user = "", _tier = "-1", duration = "30"] = d.split(":");
          let tier = parseInt(_tier) || -1;
          tier = tier >= _tierlist_.length ? _tierlist_.length - 1 : tier;
          return {
            user: user.trim(),
            tier,
            duration: (parseInt(duration) || 30) * 24 * 60 * 60,
            limit: _limitlist_[tier],
          } as UserTierData;
        });
      },
      validate: async () => {
        const param_data = (await this.getParamValue("data")) as UserTierData[];
        if (param_data.filter((d) => d.user == "" || d.tier == -1).length)
          return false;

        return true;
      },
    },
  };
  public expectedArgs: string = "`" + this.params.data.example! + "`";

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
    const param_data = (await this.getParamValue("data")) as UserTierData[];

    for (const data of param_data) {
      const { user, tier, duration, limit } = data;

      await this.getBOT().setUserConfig(user as string, "tier", tier as number);
      await this.getBOT().setUserConfig(
        user as string,
        "duration",
        (duration as number) * 1000 + Date.now()
      );
      await this.getBOT().setUserConfig(
        user as string,
        "limit",
        limit as number
      );

      await this.autoWA.sendText({
        to: user,
        text: await this.getSentence("uplan_upgraded", {
          tier: _tierlist_[tier as number],
          duration: Math.ceil((duration as number) / (60 * 60 * 24)),
        }),
      });
    }

    await this.msg.replyWithText(await this.getSentence("uplan_success"));
  }
}
