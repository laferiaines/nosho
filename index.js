const Telegraf = require("telegraf");
const fs = require("fs");

const PSWD = "ADMIN"
let alreadyBought = false;

const channel = "@NoSho_PT"

let interval;

const bot = new Telegraf("1454925277:AAG6gIrAX8yYpjEQHxEYZpHGM0ByUqrDhZ4", {channelMode: true})

bot.start( (ctx) => {
	
	const nome = ctx.message.from.first_name
	
    ctx.reply("Rules of the club\n\nHowdy "+nome+" ! Thanks for getting me started ! You are now officially a part of NoSho. Welcome to the club 👏🏼👏🏼 Bra-vo!\n\nAt NoSho we want to provide you with last minute table availability in the most popular places in town. So you can spontaneously book seats if you suddenly decide to go out for a meal or even if you like to be surprised by what will be on offer. \n\nHere’s how this works. Whenever a restaurant has a last minute availability, I will message the channel and let all the members know. The message will state the name of the restaurant, table for how many, what time and if you’re lucky, some promo too. All you have to do is press the Book button that follows the message. Be fast and be decisive, as you will be competing against the other members of the NoSho club. \n\nIf you win, you will get notified by me, to send your contact to the restaurant in order to validade your reservation. You then have until the reservation hour to show up, which depending on how last minute it is, can mean just some mere minutes. Unless you reach a time agreement with the restaurant. \n\nNow "+nome+ ", a word of notice though, please don’t book if your intentions aren’t to attend that restaurant ! We don’t want you to be the party pooper of the club 😉 \n\nThat’s all from me at this point ! So, I wish you good luck with your bookings. May the food be with you ! 😎"	
	)
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
		
        bot.telegram.sendMessage(channel,"Congratulations "+firstName+ " 👏🏼👏🏼 You were the fastest gunslinger of this booking. Our bot will now message you in private. 😎")
		
        bot.telegram.sendMessage(userId,"Congratulations " +firstName+ " on winning this booking 👏🏼 !\n\nNow, to confirm your win, we need you to provide your contact details and await confirmation from the restaurant. Your contact will not be stored anywhere and will only be seen by the restaurant host.\n\nPlease type /contact followed by your first, last name and phone number like this example: \n\n/contact Miguel Fontes +3519194445237")
		
		
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
			
            ctx.reply("Thank you 😊 The restaurant will contact you soon ! 😁")
			
            currentSells.splice(currentSells.indexOf(sell),1)
        }
    } else {
        ctx.reply("Hey ho ! Hold your horses son ! Only send your contact when I ask you for it 😉")
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

bot.command("text", (ctx) => {
	
	if (ctx.message) {
		
        let req = ctx.message.text.split(" ")
        const password = req[1]
		req.splice(0,2)
        message = req.join(" ")

		if (password && password==PSWD && req && message) {
            ctx.reply("Message sent! ")
            bot.telegram.sendMessage(channel,message)
        } else {
            ctx.reply("Invalid syntax ! ")
        }
    }
})


bot.launch();