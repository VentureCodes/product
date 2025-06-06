import { Telegraf } from 'telegraf'

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN!)

bot.start((ctx) => ctx.reply('Welcome to the Dollar app Bot🔥'))
bot.help((ctx) => ctx.reply('How can I help you?'))

export default bot
