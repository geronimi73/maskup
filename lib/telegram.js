"use server"

import TelegramBot from 'node-telegram-bot-api';
import { getUserIpAddress } from "@/lib/ip"

const token = process.env.TELEGRAM_TOKEN
const chatId = process.env.TELEGRAM_CHATID

const bot = new TelegramBot(token);

export const sendTelegramMessage = async (message) => {
  try {
    await bot.sendMessage(chatId, message);
    console.log(message)
    console.log('Telegram message sent successfully: ' + message.substring(0, 10));
  } catch (error) {
    console.error('Error sending message (' + message + ')', error);
  }
};