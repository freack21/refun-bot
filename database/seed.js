"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const firebase_1 = require("../src/data/firebase");
const userConfig_json_1 = __importDefault(require("./userConfig.json"));
function seedSentences() {
    return __awaiter(this, void 0, void 0, function* () {
        // await DB.collection("sentences")
        //   .doc("id")
        //   .update({
        //     menu: fs.readFileSync(path.join(__dirname, "./menu-id.txt"), {
        //       encoding: "utf-8",
        //     }),
        //   });
        for (const user in userConfig_json_1.default) {
            yield firebase_1.DB.collection("userConfig")
                .doc(user)
                .set(userConfig_json_1.default[user]);
        }
        console.log("Seeded!");
    });
}
seedSentences().catch(console.error);
