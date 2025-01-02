const Command = require("./base/");
const CommandHandler = require("./handler/CommandHandler");

class Menu extends Command {
  aliases = ["menu", "ls"];
  name = "Menu";

  constructor(autoWA, msg, args, commandHandler) {
    super(autoWA, msg, args, commandHandler);
  }

  getListCommand() {
    return this.commandHandler.handlers().map((handler) => {
      return `*${handler.name}* - ${
        handler.description || "no description provided"
      }, _e.g._: ${handler.aliases.join(", ")}`;
    });
  }

  async execute() {
    const listCommand = this.getListCommand();
    let menu = `*List Command:*\n${listCommand.join("\n-\n")}`;
    await this.autoWA.sendText({
      to: this.msg.from,
      text: menu,
      answering: this.msg,
    });
  }
}

module.exports = Menu;
