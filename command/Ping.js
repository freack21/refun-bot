const Command = require("./base/");

class Ping extends Command {
  aliases = ["ping"];

  constructor(autoWA, msg, args) {
    super(autoWA, msg, args);
  }

  async execute() {
    await this.autoWA.sendText({
      to: this.msg.from,
      text: "Pong!",
    });
  }
}

module.exports = Ping;
