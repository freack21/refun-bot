import FundayBOT from "../FundayBOT";
import { ExpectAnswers } from "../types";
import { IWAutoMessageReceived } from "whatsauto.js";
import fs from "fs";
const compareStrings = require("compare-strings");

export default class Matcher {
  private unAnsweredMsgs: Map<string, Map<string, ExpectAnswers>>;
  private fundayBOT: FundayBOT;
  private MATCHER_DB_PATH = "./database/matcher.json";

  constructor(fundayBOT: FundayBOT) {
    this.unAnsweredMsgs = new Map();

    this.fundayBOT = fundayBOT;

    this.loadState();

    setInterval(async () => {
      for (const [room, topicsMap] of this.unAnsweredMsgs.entries()) {
        for (const [topic, expectAnswers] of topicsMap.entries()) {
          const timeoutTime =
            expectAnswers.createdAt + expectAnswers.duration * 1000;

          if (timeoutTime < Date.now()) {
            topicsMap.delete(topic);

            await this.fundayBOT.autoWA.sendText({
              to: expectAnswers.msg.key?.remoteJid!,
              text: expectAnswers.timeout_msg,
              answering: expectAnswers.msg,
            });

            await this.saveState();
          }
        }
      }
    }, 1000);
  }

  saveState() {
    const raw = Object.fromEntries(
      [...this.unAnsweredMsgs.entries()].map(([room, topicsMap]) => [
        room,
        Object.fromEntries(topicsMap.entries()),
      ])
    );
    fs.writeFileSync(this.MATCHER_DB_PATH, JSON.stringify(raw, null, 2));
  }

  loadState() {
    if (!fs.existsSync(this.MATCHER_DB_PATH)) return;

    const raw = JSON.parse(fs.readFileSync(this.MATCHER_DB_PATH, "utf-8"));
    for (const room in raw) {
      const topicEntries = Object.entries(raw[room]) as [
        string,
        ExpectAnswers
      ][];
      this.unAnsweredMsgs.set(room, new Map(topicEntries));
    }
  }

  getUnAnsweredMsgs(room: string) {
    return this.unAnsweredMsgs.get(room);
  }

  getUnAnsweredMsg(room: string, topic: string) {
    return this.unAnsweredMsgs.get(room)?.get(topic);
  }

  setUnAnsweredMsg(room: string, topic: string, value: ExpectAnswers) {
    if (!this.getUnAnsweredMsgs(room)) {
      const newTopic: Map<string, ExpectAnswers> = new Map();
      newTopic.set(topic, value);
      this.unAnsweredMsgs.set(room, newTopic);
    } else {
      this.getUnAnsweredMsgs(room)?.set(topic, value);
    }

    this.saveState();
  }

  async checkAnsweringMsg(msg: IWAutoMessageReceived) {
    for (const [room, topicsMap] of this.unAnsweredMsgs.entries()) {
      if (msg.from != room) continue;

      for (const [topic, expectAnswers] of topicsMap.entries()!) {
        if (msg.quotedMessage?.key?.id != expectAnswers.msg.key?.id) continue;

        const similarities = expectAnswers.answers.map((answer) => {
          return {
            answer,
            score: compareStrings(answer, msg.text) as number,
          };
        });
        const bestMatch = similarities.reduce((prev, current) => {
          return current.score > prev.score ? current : prev;
        });
        const { answer: the_answer, score: similarity } = bestMatch;

        if (similarity == 1) {
          const myTopic = this.getUnAnsweredMsg(room, topic);

          if (myTopic)
            myTopic.answers = myTopic.answers.filter(
              (answer) => answer != the_answer
            );

          if (myTopic?.answers.length === 0) {
            this.unAnsweredMsgs.get(room)?.delete(topic);
            this.saveState();
          } else {
            myTopic && this.setUnAnsweredMsg(room, topic, myTopic);
          }

          expectAnswers.reward &&
            this.fundayBOT.updateUserPoint(
              msg.from,
              msg.author,
              expectAnswers.reward
            );

          let text = expectAnswers.right_msg;
          if (myTopic?.answers.length) {
            text += this.fundayBOT.getSentence(msg.author, "answer_remaining", {
              i: myTopic?.answers.length,
            });
          }

          await msg.replyWithText(text);
        } else if (similarity >= 0.7) {
          await msg.replyWithText(expectAnswers.a_07_msg);
        } else if (similarity >= 0.5) {
          await msg.replyWithText(expectAnswers.a_05_msg);
        } else {
          await msg.replyWithText(expectAnswers.wrong_msg);
        }
      }
    }
  }
}
