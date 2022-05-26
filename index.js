const express = require("express");
const fs = require("fs");
const path = require("path");
const admins = [5016283185, 1864619635, 409109434, 672801805];
const port = process.env.PORT || 3000;
const app = express();
//
const TelegramBot = require("node-telegram-bot-api");
const { match } = require("assert");
const res = require("express/lib/response");
const token = "1845440789:AAEo-g49_GXVKXrXspabsWFTawBe9oZkpyY";
const bot = new TelegramBot(token, { polling: true });

app.use(express.static(path.join(__dirname, "client"))).get("/", (req, res) => {
  res.sendFile("index.html");
});

app.listen(port, () => {
  console.log(`connected: ${port}`);
});

let selectedFile = null;

let defaultFile = JSON.stringify({
  lir: 0,
  add: [],
  debt: [],
  credit: [],
});

// /new nameFile
bot.onText(/\/new (.+)/, (msg, match) => {
  const chatId = msg.chat.id;
  const resp = match[1];
  if (admins.includes(chatId)) {
    const address = "./database/" + resp + ".json";
    fs.writeFile(address, defaultFile, "utf8", (err) => {
      console.log(err);
    });
    bot.sendMessage(chatId, "فایل مورد نظر ساخته شد.");
    selectedFile = address;
  } else {
    bot.sendMessage(chatId, "your not admin");
  }
});

// /add 99.50
bot.onText(/\/add (.+)/, (msg, match) => {
  const chatId = msg.chat.id;
  const resp = match[1];
  if (admins.includes(chatId)) {
    fs.readFile(selectedFile, "utf8", (err, data) => {
      if (err) {
        console.error(err);
        return;
      }
      const obj = JSON.parse(data);
      obj.add.push(resp.toString());
      const json = JSON.stringify(obj);
      fs.writeFile(selectedFile, json, "utf8", (err) => {
        console.log(err);
      });
      bot.sendMessage(chatId, "اضافه شد");
    });
  } else {
    bot.sendMessage(chatId, "your not admin");
  }
});

bot.onText(/\/select (.+)/, (msg, match) => {
  const chatId = msg.chat.id;
  const resp = match[1];
  if (admins.includes(chatId)) {
    selectedFile = "./database/" + resp + ".json";
    bot.sendMessage(chatId, "انتخاب شد");
  } else {
    bot.sendMessage(chatId, "your not admin");
  }
});

bot.onText(/\/lir (.+)/, (msg, match) => {
  const chatId = msg.chat.id;
  const resp = match[1];
  if (admins.includes(chatId)) {
    fs.readFile(selectedFile, "utf8", (err, data) => {
      if (err) {
        console.error(err);
        return;
      }
      const obj = JSON.parse(data);
      obj.lir = resp;
      const json = JSON.stringify(obj);
      fs.writeFile(selectedFile, json, "utf8", (err) => {
        console.log(err);
      });
      bot.sendMessage(chatId, "به روزرسانی شد");
    });
  } else {
    bot.sendMessage(chatId, "your not admin");
  }
});

bot.onText(/\/debt (.+)/, (msg, match) => {
  const chatId = msg.chat.id;
  const resp = match[1];
  if (admins.includes(chatId)) {
    fs.readFile(selectedFile, "utf8", (err, data) => {
      if (err) {
        console.error(err);
        return;
      }
      const obj = JSON.parse(data);
      obj.debt.push(resp.toString());
      const json = JSON.stringify(obj);
      fs.writeFile(selectedFile, json, "utf8", (err) => {
        console.log(err);
      });
      bot.sendMessage(chatId, "اضافه شد");
    });
  } else {
    bot.sendMessage(chatId, "your not admin");
  }
});

bot.onText(/\/credit (.+)/, (msg, match) => {
  const chatId = msg.chat.id;
  const resp = match[1];
  if (admins.includes(chatId)) {
    fs.readFile(selectedFile, "utf8", (err, data) => {
      if (err) {
        console.error(err);
        return;
      }
      const obj = JSON.parse(data);
      obj.credit.push(resp.toString());
      const json = JSON.stringify(obj);
      fs.writeFile(selectedFile, json, "utf8", (err) => {
        console.log(err);
      });
      bot.sendMessage(chatId, "اضافه شد");
    });
  } else {
    bot.sendMessage(chatId, "your not admin");
  }
});

bot.onText(/\/result/, (msg, match) => {
  const chatId = msg.chat.id;
  let msg2 = "";
  if (admins.includes(chatId)) {
    fs.readFile(selectedFile, "utf8", (err, data) => {
      if (err) {
        console.error(err);
        return;
      }
      const obj = JSON.parse(data);
      const lir = obj.lir;
      let addCount = 0;
      let debtCount = 0;
      let creditCount = 0;
      obj.add.forEach((element) => {
        addCount += parseFloat(element);
      });
      obj.debt.forEach((el) => {
        debtCount += parseFloat(el);
      });
      obj.credit.forEach((el) => {
        creditCount += parseFloat(el);
      });
      const finalResult = -lir * addCount - debtCount + creditCount;

      msg2 =
        "نرخ امروز:" +
        lir +
        "\n\n" +
        "جمع خرید های امروز به لیر: " +
        addCount.toFixed(2) +
        "\n" +
        "جمع خرید های امروز به تومان: " +
        Math.floor(addCount * lir)
          .toString()
          .replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
        "\n\n" +
        "بدهکاری از قبل " +
        debtCount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
        "\n" +
        "بستانکاری از قبل " +
        creditCount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
        "\n\n";

      if (finalResult < 0) {
        msg2 +=
          "مانده بدهکاری " +
          Math.floor(Math.abs(finalResult))
            .toString()
            .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      } else {
        msg2 +=
          "مانده بستانکاری " +
          Math.floor(Math.abs(finalResult))
            .toString()
            .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      }

      bot.sendMessage(chatId, msg2);
    });
  } else {
    bot.sendMessage(chatId, "your not admin");
  }
});
