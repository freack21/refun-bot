const { AutoWA, WAutoMessageCompleteClass } = require("whatsauto.js");

class Command {
  constructor(
    autoWA = new AutoWA(),
    msg = new WAutoMessageCompleteClass(),
    args = [""]
  ) {
    this.autoWA = autoWA;
    this.msg = msg;
    this.args = args;
  }

  async execute() {
    throw new Error("execute is not implemented");
  }
}

module.exports = Command;
