const { AutoWA } = require("whatsauto.js");
const CommandHandler = require("./command/handler");

class RefunBot {
  contructor() {
    this.name = "Refun Bot";
    this.isReading = false;
  }

  async startBot() {
    this.autoWA = new AutoWA("RefunBot");
    this.autoWA.event.onConnecting(() => {
      console.log("RefunBot is connecting...");
    });

    this.autoWA.event.onConnected(() => {
      console.log("RefunBot is ready!");
    });

    this.autoWA.event.onMessage(async (msg) => {
      await this.autoWA.readMessage({ key: msg.key });
    });

    this.autoWA.event.onMessageReceived(async (msg) => {
      const msgText = msg.text || "";
      const command = this.getCommand(msgText);
      const args = this.getArgs(msgText);

      const commandHandler = new CommandHandler(this.autoWA, msg, args);

      const handler = commandHandler
        .handlers()
        .filter((handler) => handler.aliases.includes(command))[0];
      if (handler) {
        await this.autoWA.sendReaction({
          to: msg.from,
          text: "⌛",
          answering: msg,
        });
        await handler.execute();
        await this.autoWA.sendReaction({
          to: msg.from,
          text: "",
          answering: msg,
        });
      }
    });
    await this.autoWA.initialize();
  }

  getCommand(text = "") {
    text = text.toLowerCase();
    return text.replace(/^[^a-zA-Z]+/, "").split(" ")[0];
  }

  getArgs(text = "") {
    return text
      .split(" ")
      .slice(1)
      .join(" ")
      .split("|")
      .map((x) => x.trim());
  }
}

module.exports = RefunBot;
