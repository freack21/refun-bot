export const _languages_ = ["en", "id"] as const;
export type Language = (typeof _languages_)[number];

const lang: Record<Language, Record<string, string>> = {
  en: {
    menu: "Hello @{user} 👋\n\n{menu}",
    success_ChangeLanguage: "✅ Success in changing your language preference!",
    validation:
      "Please put the _*required*_ argument(s) to execute *{name}* command.",
    error_command: "_*Error*_ while trying to execute *{name}* command.",
    args_not_valid: "Your argument for this command is not valid",
    explanation: "Explanation",
    valid_arg: "Valid Argument(s)",
    arguments: "*Argument(s)*:\n{args}",
    aliases: "*Alias(es)*:\n{alias}",
    notes: "*Note(s):*\n✅ = required\n❓ = optional",
    menulist: "⭐ *{name}* {desc} — _alias(es):_ {alias}",
  },
  id: {
    menu: "Halo @{user} 👋\n\n{menu}",
    success_ChangeLanguage: "✅ Sukses mengubah preferensi bahasa kamu!",
    validation:
      "Silahkan menuliskan argumen _*wajib*_ untuk mengeksekusi perintah *{name}*.",
    error_command: "_*Eror*_ terjadi saat mengeksekusi perintah *{name}*.",
    args_not_valid: "Argumen kamu untuk perintah ini tidak valid",
    explanation: "Penjelasan",
    valid_arg: "Argumen Valid",
    arguments: "*Argumen*:\n{args}",
    aliases: "*Alias*:\n{alias}",
    notes: "*Catatan:*\n✅ = wajib\n❓ = opsional",
    menulist: "⭐ *{name}* {desc} — _alias:_ {alias}",
  },
};

export default lang;
