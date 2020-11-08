const Telegraf = require("telegraf");
const fs = require("fs");
const Extra = require('telegraf/extra')
const Markup = require('telegraf/markup')


const cool = require('cool-ascii-faces');
const express = require('express');
const path = require('path');
const PORT = process.env.PORT || 5000;

express()
  .use(express.static(path.join(__dirname, 'public')))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .get('/', (req, res) => res.render('pages/index'))
  .get('/cool', (req, res) => res.send(cool()))
  .listen(PORT, () => console.log(`Listening on ${ PORT }`));


const PSWD = "ADMIN"
let alreadyBought = false;

const channel = "@NoSho_PT"

let interval;

const bot = new Telegraf("1394341645:AAHZSiEm2kw9Zxm3kOa3ghtEY2CGZ5n3C5M", {channelMode: true})

bot.start( (ctx) => {
	
	const nome = ctx.message.from.first_name
    ctx.reply("Rules of the club\n\nHowdy "+nome+" ! Thanks for getting me started ! You are now officially a part of NoSho. Welcome to the club 👏🏼👏🏼 Bra-vo!\n\nAt NoSho we want to provide you with last minute table availability in the most popular places in town. So you can spontaneously book seats if you suddenly decide to go out for a meal or even if you like to be surprised by what will be on offer. \n\nHere’s how this works. Whenever a restaurant has a last minute availability, I will message the channel and let all the members know. The message will state the name of the restaurant, table for how many, what time and if you’re lucky, some promo too. All you have to do is press the Book button that follows the message. Be fast and be decisive, as you will be competing against the other members of the NoSho club. \n\nIf you win, you will get notified by me, to send your contact to the restaurant in order to validade your reservation. You then have until the reservation hour to show up, which depending on how last minute it is, can mean just some mere minutes. Unless you reach a time agreement with the restaurant. \n\nNow "+nome+ ", a word of notice though, please don’t book if your intentions aren’t to attend that restaurant ! We don’t want you to be the party pooper of the club 😉 \n\nThat’s all from me at this point ! So, I wish you good luck with your bookings. May the food be with you ! 😎"	
	)
	
})


let currentSells = [];

bot.on('contact', (ctx) => {

	const firstName = ctx.update.message.contact.first_name
	const lastName = ctx.update.message.contact.last_name
	const phoneNumber = ctx.update.message.contact.phone_number
    
	const buyerId = ctx.update.message.chat.id
	
	let currentSell

    for (sell of currentSells) {
        if (sell.buyerId == buyerId) {
            currentSell = sell
        }
    }
    if (currentSell) {
        if (phoneNumber) {
			if(lastName) {
            ctx.telegram.sendMessage(currentSell.sellerId,"A mesa foi reservada por:\n\nNome: "+firstName+ " " +lastName+ "\n\Número: +" +phoneNumber+"\n\nPor favor entre em contacto com o cliente para validar a reserva.")
			}
			else {
		ctx.telegram.sendMessage(currentSell.sellerId,"A mesa foi reservada por:\n\nNome: "+firstName+"\n\Número: +" +phoneNumber+"\n\nPor favor entre em contacto com o cliente para validar a reserva.")
            }
			ctx.reply("Contact sent, thank you 😊")
			
            currentSells.splice(currentSells.indexOf(sell),1)
        }
    }

})

bot.command("nosho", (ctx) => {
    
	let msg = ctx.message.text.split(" ")
	
	if (msg[1] == PSWD) {
        currentSells.push({
            alreadyBought: false,
            sellerId: ctx.chat.id
        })
	

	const promo = msg[msg.length-1]
	const time = msg[msg.length-2]
	const people = msg[msg.length-3]
	
	let restaurant
	restaurant = msg.splice(2, msg.length-5)
	restaurant = restaurant.join(" ")
	
	
	bot.telegram.sendMessage(channel,"Restaurant : "+restaurant+"\nTable for : "+people+ "\nTime : " + time+ "\nPromo: "+promo,{reply_markup: {
            inline_keyboard: [
                [{text:"Book now ",callback_query:"blz",callback_data:ctx.chat.id+" "+restaurant+" "+people+" "+ time}]
            ]
            }
        })
		.then(function (result) {
	
			interval = setTimeout( () => {
						bot.telegram.deleteMessage(channel, result.message_id)
					},900000)
		});
	}
})

bot.on('unhandledRejection', (reason, p) => {
  console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
  // application specific logging, throwing an error, or other logic here
});


bot.action(/[0-9]/, (ctx) => {
    try {
        ctx.deleteMessage()
    } catch (err) { console.log("")}

	const msg = ctx.update.callback_query.data.split(" ")

    const sellerId = msg[0]

	let restaurant
	restaurant = msg.splice(1, msg.length-3)
	restaurant = restaurant.join(" ")
console.log(restaurant);
	const nrPessoas = msg[msg.length-2]
	const hora = msg[msg.length-1]
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
		
        bot.telegram.sendMessage(channel,"Congratulations "+firstName+ " 👏🏼👏🏼 \""+restaurant+"\" was booked for "+nrPessoas+" people at "+hora+ ". Our bot has DM'ed you with further instructions.") 
		
		let nrMembers
		let message
		message = bot.telegram.getChatMembersCount(channel).then(nrMembers => {	
															console.log("nrMembers: "+nrMembers)
															bot.telegram.sendMessage(userId,"Congratulations "+firstName+ " 👏🏼 you were the fastest among "+nrMembers+" subscribers of NoSho club to book \""+restaurant+"\" !\n\nTo confirm this table of "+nrPessoas+" at "+hora+ ", we need you to provide your contact details to \""+restaurant+"\". Your contact will not be stored anywhere and will only be seen by the restaurant host.\n\nJust press the button below 👇🏼", 
		Extra.markup((markup) => {
			return markup.keyboard([
					markup.contactRequestButton('Send contact')
					])
				.oneTime()
	  
		}))
		})
		currentSell.buyerId = userId								
		      
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
            ctx.reply("Invalid syntax! ")
        }
    }
})

bot.launch();