const Ping = require("../Ping");
const fs = require("fs");
const path = require("path");

class CommandHandler {
  constructor(autoWA, msg, args) {
    this.autoWA = autoWA;
    this.msg = msg;
    this.args = args;
  }

  getHandlerFiles() {
    return fs
      .readdirSync(path.join(__dirname, "../"))
      .filter((file) => file.endsWith(".js") && file !== "index.js");
  }

  handlers() {
    return this.getHandlerFiles().map((file) => {
      const handler = require(`../${file}`);
      return new handler(this.autoWA, this.msg, this.args);
    });
  }
}

module.exports = CommandHandler;
