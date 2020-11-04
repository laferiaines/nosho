const Telegraf = require("telegraf");
const fs = require("fs");

const PSWD = "ADMIN"
let alreadyBought = false;

const channel = "@NoSho_PT"

let interval;

const bot = new Telegraf("1454925277:AAG6gIrAX8yYpjEQHxEYZpHGM0ByUqrDhZ4", {channelMode: true})

bot.start( (ctx) => {
    ctx.reply("Welcome. You are registered now !")
})

bot.on('new_chat_members', (ctx) => {
	ctx.reply("bem vindo ao NoSho!! ");
	
})

let currentSells = [];

bot.command("nosho", (ctx) => {
    const msg = ctx.message.text.split(" ")
    if (msg[1] == PSWD) {
        currentSells.push({
            alreadyBought: false,
            sellerId: ctx.chat.id
        })
        bot.telegram.sendMessage(channel,"Restaurant : "+msg[2]+"\nTable for : "+msg[3]+ "\nTime : " + msg[4]+ "\nPromo : " + msg[5],{reply_markup: {
            inline_keyboard: [
                [{text:"Book now",callback_query:"blz",callback_data:ctx.chat.id}]
            ]
            }
        })
    }
})

bot.action(/[0-9]/, (ctx) => {
    try {
        ctx.deleteMessage()
    } catch (err) { console.log("")}


    const sellerId = ctx.update.callback_query.data
    const userId = ctx.update.callback_query.from.id
    const username = ctx.update.callback_query.from.username
    const firstName = ctx.update.callback_query.from.first_name
	const lastName = ctx.update.callback_query.from.last_name

    let currentSell

	
    for (sell of currentSells) {
        if (sell.sellerId = sellerId) {
            currentSell = sell
        }
    }

    if (!currentSell.alreadyBought) {
        currentSell.alreadyBought = true;
        bot.telegram.sendMessage(channel,"Congratulations to "+firstName+" "+lastName+" who is the first to have clicked on the buy button ! 👏")
        bot.telegram.sendMessage(userId,"Congratulations " + firstName + " 👏🏼 ! You were the fastest to book this table ! \n\nPlease provide your contact details and await confirmation from the restaurant. \n\nPlease type your first, last name and phone number like this: /contact Miguel Fontes +351xxxxxxxx ")
		currentSell.buyerId = userId								
		      
    }
})

bot.command("contact", (ctx) => {
    const phoneNumber = ctx.message.text.split(" ")[3]
    const firstName = ctx.message.text.split(" ")[1]
    const lastName = ctx.message.text.split(" ")[2]

    const buyerId = ctx.message.chat.id

    let currentSell

    for (sell of currentSells) {
        if (sell.buyerId == buyerId) {
            currentSell = sell
        }
    }
    if (currentSell) {
        if (phoneNumber) {
            ctx.telegram.sendMessage(currentSell.sellerId,"Olá, a mesa foi reservada por "+firstName+ " " +lastName+ " " +phoneNumber+", por favor entre em contacto com o cliente para validar a reserva.")
            ctx.reply("The seller will contact you soon ! 😁")
            currentSells.splice(currentSells.indexOf(sell),1)
        }
    } else {
        ctx.reply("You are not associated with any existing sell. 😢")
    }
    
})

bot.command("schedule", (ctx) => {
    if (ctx.message) {
        let req = ctx.message.text.split(" ")
        const password = req[1]
        const delay = parseFloat(req[2])*1000*60*60;
        req.splice(0,3)
        message = req.join(" ")
        if (password && password==PSWD && delay && req && message) {
            ctx.reply("Ok ! ")
            interval = setInterval( () => {
                bot.telegram.sendMessage(channel,message)
            },delay)
        } else {
            ctx.reply("Invalid syntax ! ")
        }
        
    }
})



bot.launch();

