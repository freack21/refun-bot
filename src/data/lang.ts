export const _languages_ = ["en", "id"] as const;
export type Language = (typeof _languages_)[number];
export type Replacements = Record<string, string | number>;

const lang: Record<Language, Record<string, string>> = {
  en: {
    menu: "Hello @{user} 👋\n\n*BOT INFO*\n  🔹 Name : {bot_name}\n  🔹 Prefix : `all`\n\n*USER INFO*\n  🔹 Name : {user_name}\n  🔹 Nickname : {user_nick}\n  🔹 Limit : {user_limit}\n\n{menu}",
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
    menulist: "  {icon} *{name}* {desc} — _alias(es):_ {alias}",
    qc_server_error: "The QuickChat maker server refused the connection😥",
    simi_empty_msg: "Messages cannot be sent😥",
    simi_server_err: "Server cannot connect to SimSimi🥺",
  },
  id: {
    menu: "Halo @{user} 👋\n\n*INFO BOT*\n  🔹 Nama : {bot_name}\n  🔹 Prefix : `all`\n\n*INFO USER*\n  🔹 Nama : {user_name}\n  🔹 Nickname : {user_nick}\n  🔹 Limit : {user_limit}\n\n{menu}",
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
    menulist: "  {icon} *{name}* {desc} — _alias:_ {alias}",
    qc_server_error: "Server QuickChat Maker menolak koneksi😥",
    simi_empty_msg: "Pesan tidak dapat dikirim😥",
    simi_server_err: "Server tidak dapat menghubungkan ke SimSimi🥺",
  },
};

export default lang;
