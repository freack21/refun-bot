const { AutoWA, WAutoMessageCompleteClass } = require("whatsauto.js");
const CommandHandler = require("../handler/CommandHandler");

class Command {
  name = "this";
  messages = {
    error: "Error while trying to execute {name} command.",
    validation:
      "Please put the required argument(s) to execute {name} command.",
  };
  params = {
    // Example:
    // name: {
    //   required: false,
    //   description: "The name you want to put in QuickChat",
    //   example: "John Doe",
    //   value: "WhatsAuto.js",
    // },
  };

  constructor(
    autoWA = new AutoWA(),
    msg = new WAutoMessageCompleteClass(),
    args = [""],
    commandHandler = new CommandHandler()
  ) {
    this.autoWA = autoWA;
    this.msg = msg;
    this.args = args;
    this.commandHandler = commandHandler;
  }

  async execute() {
    throw new Error("execute is not implemented");
  }

  getErrorMessage() {
    return this.messages.error.replace("{name}", this.name);
  }

  getValidationMessage() {
    const parameters = [];
    for (const key in this.params) {
      const param = `_${
        this.params[key].required ? "required" : "optional"
      }_ | *${key}* - ${this.params[key].description}${
        this.params[key].example ? `, _e.g. ${this.params[key].example}_` : ""
      }`;
      parameters.push(param);
    }
    let validationMsg = this.messages.validation.replace("{name}", this.name);
    if (parameters.length) {
      validationMsg += `\n\n*Argument(s):*\n${parameters.join("\n-\n")}`;
    }

    return validationMsg;
  }

  async sendExecutionError() {
    await this.autoWA.sendText({
      to: this.msg.from,
      text: this.getErrorMessage(),
      answering: this.msg,
    });
  }

  async sendValidationError() {
    await this.autoWA.sendText({
      to: this.msg.from,
      text: this.getValidationMessage(),
      answering: this.msg,
    });
  }
}

module.exports = Command;
