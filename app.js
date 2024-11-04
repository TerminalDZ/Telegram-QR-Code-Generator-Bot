const TelegramBot = require("node-telegram-bot-api");
const QRCode = require("qrcode");
const fs = require("fs");
const path = require("path");
const axios = require("axios");
require("dotenv").config();

const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_API_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const token = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });

let qrSettings = {
  size: 200,
  colorDark: "#000000",
  colorLight: "#FFFFFF",
  format: "png",
  encrypt: false,
};

let language = "ar";

const messages = {
  ar: {
    welcome: "مرحبًا بك في بوت مولد QR Code.",
    enter_text: "يرجى إدخال النص الذي تريد تحويله إلى QR Code.",
    settings: "الإعدادات:",
    help: "اكتب /qr لتوليد QR Code.",
    size_increased: (size) => `تم زيادة حجم الـ QR Code إلى ${size}.`,
    size_decreased: (size) => `تم تقليل حجم الـ QR Code إلى ${size}.`,
    color_changed: (color) => `تم تغيير لون الـ QR Code إلى ${color}.`,
    format_changed: (format) => `تم تغيير تنسيق الملف إلى ${format}.`,
    qr_generated: "إليك QR Code الخاص بك.",
    error_occurred: "حدث خطأ. يرجى المحاولة مرة أخرى.",
    data_deleted: "تم حذف البيانات القديمة.",
    enter_encryption_key:
      "يرجى إدخال النص الذي تريد تحويله، متبوعًا بمفتاح التشفير (مثال: النص | المفتاح).",
    text_encrypted: "تم تشفير النص. يرجى الاحتفاظ بالمفتاح لفك التشفير.",
    language_changed: (lang) => `تم تغيير اللغة إلى ${lang}.`,
    encryption_enabled: "تم تفعيل التشفير.",
    encryption_disabled: "تم إلغاء التشفير.",
    no_saved_links: "لا يوجد روابط محفوظة.",
    saved_links: "الروابط المحفوظة:",
    choose_language: "يرجى اختيار اللغة:",
    back_to_main_menu: "رجوع إلى القائمة الرئيسية",
    choose_color: "اختر اللون:",
    generate_whatsapp: "توليد QR لـ WhatsApp",
    generate_vcard: "توليد QR لبطاقة vCard",
    predefined_messages: "رسائل محفوظة مسبقًا",
    stats: "إحصائيات الاستخدام",
    usage_stats: (count) => `لقد استخدمت البوت ${count} مرة.`,
    most_used_texts: "أكثر النصوص التي تم إنشاء QR لها:",
    enter_phone: "يرجى إدخال رقم الهاتف:",
    enter_vcard_info:
      "يرجى إدخال معلومات vCard (الاسم، الهاتف، البريد الإلكتروني، إلخ):",
    select_predefined_message: "اختر رسالة:",
  },
  en: {
    welcome: "Welcome to QR Code Generator Bot.",
    enter_text: "Please enter the text you want to convert to a QR Code.",
    settings: "Settings:",
    help: "Type /qr to generate a QR Code.",
    size_increased: (size) => `QR Code size increased to ${size}.`,
    size_decreased: (size) => `QR Code size decreased to ${size}.`,
    color_changed: (color) => `QR Code color changed to ${color}.`,
    format_changed: (format) => `File format changed to ${format}.`,
    qr_generated: "Here is your QR Code.",
    error_occurred: "An error occurred. Please try again.",
    data_deleted: "Old data has been deleted.",
    enter_encryption_key:
      "Please enter the text you want to convert, followed by the encryption key (e.g., text | key).",
    text_encrypted: "Text has been encrypted. Please keep the key to decrypt.",
    language_changed: (lang) => `Language changed to ${lang}.`,
    encryption_enabled: "Encryption enabled.",
    encryption_disabled: "Encryption disabled.",
    no_saved_links: "No saved links.",
    saved_links: "Saved links:",
    choose_language: "Please choose a language:",
    back_to_main_menu: "Back to main menu",
    choose_color: "Choose a color:",
    generate_whatsapp: "Generate WhatsApp QR",
    generate_vcard: "Generate vCard QR",
    predefined_messages: "Predefined Messages",
    stats: "Usage Statistics",
    usage_stats: (count) => `You have used the bot ${count} times.`,
    most_used_texts: "Most used texts for QR generation:",
    enter_phone: "Please enter the phone number:",
    enter_vcard_info:
      "Please enter vCard information (name, phone, email, etc.):",
    select_predefined_message: "Select a message:",
  },
};

const predefinedMessages = {
  ar: [
    { text: "موقعي الإلكتروني", value: "https://www.example.com" },
    {
      text: "حسابي على LinkedIn",
      value: "https://www.linkedin.com/in/username",
    },
    { text: "راسلني على WhatsApp", value: "https://wa.me/1234567890" },
  ],
  en: [
    { text: "My Website", value: "https://www.example.com" },
    {
      text: "My LinkedIn Profile",
      value: "https://www.linkedin.com/in/username",
    },
    { text: "Message me on WhatsApp", value: "https://wa.me/1234567890" },
  ],
};

bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (text === "/start") {
    sendMainMenu(chatId);
  } else if (text === "/help") {
    bot.sendMessage(chatId, messages[language].help);
  } else {
    handleUserMessage(chatId, msg);
  }
});

function sendMainMenu(chatId) {
  const options = {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: "🔄 " + messages[language].enter_text,
            callback_data: "generate_qr",
          },
        ],
        [
          {
            text: "📱 " + messages[language].generate_whatsapp,
            callback_data: "generate_whatsapp",
          },
        ],
        [
          {
            text: "📝 " + messages[language].generate_vcard,
            callback_data: "generate_vcard",
          },
        ],
        [
          {
            text: "💬 " + messages[language].predefined_messages,
            callback_data: "predefined_messages",
          },
        ],
        [{ text: "📊 " + messages[language].stats, callback_data: "stats" }],
        [
          {
            text: "⚙️ " + messages[language].settings,
            callback_data: "settings",
          },
        ],
        [
          {
            text: "🌐 " + messages[language].choose_language,
            callback_data: "change_language",
          },
        ],
      ],
    },
  };
  bot.sendMessage(chatId, messages[language].welcome, options);
}

bot.on("callback_query", (callbackQuery) => {
  const chatId = callbackQuery.message.chat.id;
  const data = callbackQuery.data;

  switch (data) {
    case "generate_qr":
      bot.sendMessage(chatId, messages[language].enter_text);
      bot.once("message", (msg) => {
        generateQRCode(chatId, msg.text);
        incrementUsageCount(chatId);
        saveUsedText(chatId, msg.text);
      });
      break;
    case "generate_whatsapp":
      bot.sendMessage(chatId, messages[language].enter_phone);
      bot.once("message", (msg) => {
        const phone = msg.text.replace(/\D/g, "");
        const waLink = `https://wa.me/${phone}`;
        generateQRCode(chatId, waLink);
        incrementUsageCount(chatId);
        saveUsedText(chatId, waLink);
      });
      break;
    case "generate_vcard":
      bot.sendMessage(chatId, messages[language].enter_vcard_info);
      bot.once("message", (msg) => {
        const vCardData = createVCard(msg.text);
        generateQRCode(chatId, vCardData);
        incrementUsageCount(chatId);
        saveUsedText(chatId, "vCard");
      });
      break;
    case "predefined_messages":
      sendPredefinedMessagesMenu(chatId);
      break;
    case "stats":
      sendUsageStats(chatId);
      break;
    case "settings":
      sendSettingsMenu(chatId);
      break;
    case "change_language":
      sendLanguageMenu(chatId);
      break;
    case "increase_size":
      qrSettings.size += 50;
      bot.sendMessage(
        chatId,
        messages[language].size_increased(qrSettings.size)
      );
      break;
    case "decrease_size":
      if (qrSettings.size > 100) qrSettings.size -= 50;
      bot.sendMessage(
        chatId,
        messages[language].size_decreased(qrSettings.size)
      );
      break;
    case "change_color":
      sendColorMenu(chatId);
      break;
    case "change_format":
      qrSettings.format = qrSettings.format === "png" ? "pdf" : "png";
      bot.sendMessage(
        chatId,
        messages[language].format_changed(qrSettings.format)
      );
      break;
    case "encrypt_content":
      qrSettings.encrypt = !qrSettings.encrypt;
      const encryptStatus = qrSettings.encrypt
        ? messages[language].encryption_enabled
        : messages[language].encryption_disabled;
      bot.sendMessage(chatId, encryptStatus);
      break;
    case "delete_data":
      deleteSavedLinks(chatId);
      break;
    case "back_to_main":
      sendMainMenu(chatId);
      break;
    default:
      if (data.startsWith("set_color_")) {
        const color = "#" + data.split("_")[2];
        qrSettings.colorDark = color;
        bot.sendMessage(chatId, messages[language].color_changed(color));
      } else if (data.startsWith("set_language_")) {
        language = data.split("_")[2];
        bot.sendMessage(chatId, messages[language].language_changed(language));
        sendMainMenu(chatId);
      } else if (data.startsWith("predefined_")) {
        const index = parseInt(data.split("_")[1], 10);
        const message = predefinedMessages[language][index].value;
        generateQRCode(chatId, message);
        incrementUsageCount(chatId);
        saveUsedText(chatId, message);
      }
      break;
  }
});

function sendSettingsMenu(chatId) {
  const options = {
    reply_markup: {
      inline_keyboard: [
        [
          { text: "🔼", callback_data: "increase_size" },
          { text: "🔽", callback_data: "decrease_size" },
        ],
        [
          {
            text: "🎨 " + messages[language].color_changed(""),
            callback_data: "change_color",
          },
        ],
        [
          {
            text: "📄 " + messages[language].format_changed(""),
            callback_data: "change_format",
          },
        ],
        [
          {
            text:
              "🔒 " +
              (qrSettings.encrypt
                ? messages[language].encryption_disabled
                : messages[language].encryption_enabled),
            callback_data: "encrypt_content",
          },
        ],
        [
          {
            text: "🗑️ " + messages[language].data_deleted,
            callback_data: "delete_data",
          },
        ],
        [
          {
            text: "⬅️ " + messages[language].back_to_main_menu,
            callback_data: "back_to_main",
          },
        ],
      ],
    },
  };
  bot.sendMessage(chatId, messages[language].settings, options);
}

function sendLanguageMenu(chatId) {
  const options = {
    reply_markup: {
      inline_keyboard: [
        [{ text: "العربية", callback_data: "set_language_ar" }],
        [{ text: "English", callback_data: "set_language_en" }],
      ],
    },
  };
  bot.sendMessage(chatId, messages[language].choose_language, options);
}

function sendColorMenu(chatId) {
  const options = {
    reply_markup: {
      inline_keyboard: [
        [{ text: "⚫ أسود", callback_data: "set_color_000000" }],
        [{ text: "🔴 أحمر", callback_data: "set_color_FF0000" }],
        [{ text: "🟢 أخضر", callback_data: "set_color_00FF00" }],
        [{ text: "🔵 أزرق", callback_data: "set_color_0000FF" }],
        [
          {
            text: "⬅️ " + messages[language].back_to_main_menu,
            callback_data: "settings",
          },
        ],
      ],
    },
  };
  bot.sendMessage(chatId, messages[language].choose_color, options);
}

function sendPredefinedMessagesMenu(chatId) {
  const options = {
    reply_markup: {
      inline_keyboard: predefinedMessages[language].map((item, index) => [
        { text: item.text, callback_data: `predefined_${index}` },
      ]),
    },
  };
  bot.sendMessage(
    chatId,
    messages[language].select_predefined_message,
    options
  );
}

async function sendUsageStats(chatId) {
  try {
    const { data: usageData, error: usageError } = await supabase
      .from("user_usage")
      .select("*")
      .eq("user_id", chatId)
      .single();

    if (usageError) {
      console.log(usageError);
      bot.sendMessage(chatId, messages[language].error_occurred);
      return;
    }

    const usageCount = usageData ? usageData.usage_count : 0;
    let message = messages[language].usage_stats(usageCount) + "\n";

    const { data: textsData, error: textsError } = await supabase
      .from("used_texts")
      .select("text, count")
      .eq("user_id", chatId)
      .order("count", { ascending: false })
      .limit(5);

    if (textsError) {
      console.log(textsError);
      bot.sendMessage(chatId, messages[language].error_occurred);
      return;
    }

    if (textsData.length > 0) {
      message += messages[language].most_used_texts + "\n";
      textsData.forEach((item, index) => {
        message += `${index + 1}. ${item.text} (${item.count})\n`;
      });
    }

    bot.sendMessage(chatId, message);
  } catch (error) {
    console.log(error);
    bot.sendMessage(chatId, messages[language].error_occurred);
  }
}

async function handleUserMessage(chatId, msg) {
  const text = msg.text;
  if (qrSettings.waitingForLogo && !msg.photo) {
    bot.sendMessage(chatId, messages[language].error_occurred);
  } else {
    // Treat any text as input for QR Code generation
    generateQRCode(chatId, text);
    incrementUsageCount(chatId);
    saveUsedText(chatId, text);
  }
}

async function generateQRCode(chatId, text) {
  let content = text;
  if (qrSettings.encrypt && text.includes("|")) {
    const parts = text.split("|");
    content = parts[0].trim();
    const encryptionKey = parts[1].trim();
    content = encryptText(content, encryptionKey);
    bot.sendMessage(chatId, messages[language].text_encrypted);
  }

  const qrOptions = {
    errorCorrectionLevel: "H",
    type: "png",
    color: {
      dark: qrSettings.colorDark,
      light: qrSettings.colorLight,
    },
    width: qrSettings.size,
  };

  try {
    const qrImageBuffer = await QRCode.toBuffer(content, qrOptions);
    const fileName = `qrcode_${Date.now()}.png`;
    const filePath = path.join(__dirname, fileName);
    fs.writeFileSync(filePath, qrImageBuffer);

    await bot.sendPhoto(chatId, filePath, {
      caption: messages[language].qr_generated,
    });

    fs.unlinkSync(filePath);

    await saveLinkToSupabase(chatId, content);
  } catch (error) {
    console.log(error);
    bot.sendMessage(chatId, messages[language].error_occurred);
  }
}

function encryptText(text, key) {
  let encrypted = "";
  for (let i = 0; i < text.length; i++) {
    encrypted += String.fromCharCode(
      text.charCodeAt(i) + key.charCodeAt(i % key.length)
    );
  }
  return encrypted;
}

async function saveLinkToSupabase(userId, content) {
  try {
    const { data, error } = await supabase.from("qr_codes").insert([
      {
        user_id: userId,
        content: content,
      },
    ]);

    if (error) {
      console.log(error);
    }
  } catch (error) {
    console.log(error);
  }
}

async function deleteSavedLinks(chatId) {
  try {
    const { data, error } = await supabase
      .from("qr_codes")
      .delete()
      .eq("user_id", chatId);

    if (error) {
      console.log(error);
      bot.sendMessage(chatId, messages[language].error_occurred);
    } else {
      bot.sendMessage(chatId, messages[language].data_deleted);
    }
  } catch (error) {
    console.log(error);
    bot.sendMessage(chatId, messages[language].error_occurred);
  }
}

async function incrementUsageCount(userId) {
  try {
    const { data, error } = await supabase.rpc("increment_usage", {
      userid: userId,
    });
    if (error) {
      console.log(error);
    }
  } catch (error) {
    console.log(error);
  }
}

async function saveUsedText(userId, text) {
  try {
    const { data, error } = await supabase.rpc("increment_text_count", {
      userid: userId,
      usedtext: text,
    });
    if (error) {
      console.log(error);
    }
  } catch (error) {
    console.log(error);
  }
}

function createVCard(info) {
  const lines = info.split(",");
  let vCard = "BEGIN:VCARD\nVERSION:3.0\n";
  lines.forEach((line) => {
    const [key, value] = line.split(":");
    switch (key.trim().toLowerCase()) {
      case "name":
        vCard += `FN:${value.trim()}\n`;
        break;
      case "phone":
        vCard += `TEL:${value.trim()}\n`;
        break;
      case "email":
        vCard += `EMAIL:${value.trim()}\n`;
        break;
      default:
        break;
    }
  });
  vCard += "END:VCARD";
  return vCard;
}
